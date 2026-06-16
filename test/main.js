const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

// Base URL of the stack under test (nginx). Overridable so the stack can be run
// on a non-default host port during local verification.
const BASE_URL = process.env.BASE_URL || 'http://localhost';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Signup now happens in two steps: an allauth account signup (with mandatory email
// verification) followed by a separate workspace-creation page. The dev image uses
// the console email backend, so we recover the verification link from the rapidpro
// container logs.
async function getConfirmationPath() {
    for (let attempt = 0; attempt < 15; attempt++) {
        let logs = '';
        try {
            logs = execSync('docker compose logs --no-color --no-log-prefix rapidpro', { encoding: 'utf8' });
        } catch (e) {
            // ignore transient failures, retry below
        }
        // join quoted-printable soft line breaks so a wrapped URL is contiguous
        const joined = logs.replace(/=\r?\n/g, '');
        const matches = joined.match(/\/accounts\/confirm-email\/[^\s"'<>]+/g);
        if (matches && matches.length) {
            return matches[matches.length - 1]; // most recent confirmation link
        }
        await sleep(1000);
    }
    throw new Error('No email confirmation link found in rapidpro logs');
}

// Exercises the full rapidpro -> mailroom -> elasticsearch search path from the UI. A contact
// search makes rapidpro's mailroom client POST to mailroom's /mi/contact/search endpoint, which
// in turn queries Elasticsearch. The contact list view only catches query-validation errors, so
// a break anywhere in that chain surfaces here as an HTTP 500. Mailroom has no compose
// healthcheck and only starts once rapidpro is healthy, so we retry to give it time to come up.
async function checkContactSearchPipeline(page) {
    const searchUrl = `${BASE_URL}/contact/?search=test`;

    let lastStatus;
    for (let attempt = 0; attempt < 10; attempt++) {
        const response = await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        lastStatus = response ? response.status() : 0;

        // guard against a login redirect (e.g. /accounts/login/?next=/contact/...) false-passing
        const onContactsPage = new URL(page.url()).pathname.startsWith('/contact/');

        if (lastStatus === 200 && onContactsPage) {
            const errorBanner = await page.$('.alert-error');
            if (errorBanner) {
                const errorText = await page.$eval('.alert-error', (el) => el.textContent.trim()).catch(() => '');
                throw new Error(`Contact search returned an error: ${errorText}`);
            }

            // Mailroom parses "test" into a structured query (e.g. name ~ "test") and the view
            // echoes that parsed form back into the search box. Seeing the parsed form (rather than
            // the raw term) proves the search actually round-tripped through mailroom and wasn't
            // just rendered locally.
            const parsed = await page
                .$eval('[name="search"]', (el) => el.getAttribute('value') || el.value || '')
                .catch(() => '');

            if (!parsed || parsed.trim() === 'test') {
                throw new Error(`Contact search did not round-trip through mailroom (search box shows "${parsed}")`);
            }

            console.log(`✓ Contact search round-tripped rapidpro → mailroom → elasticsearch (parsed query: "${parsed}")`);
            return;
        }

        console.log(`Mailroom not ready yet (HTTP ${lastStatus}), retrying... [${attempt + 1}/10]`);
        await sleep(3000);
    }

    throw new Error(`Contact search never succeeded - rapidpro could not reach mailroom (last HTTP ${lastStatus})`);
}

(async () => {
    console.log('Starting test...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let page;
    try {
        page = await browser.newPage();

        // unique email so re-runs against a persistent database don't collide
        const testData = {
            email: `bob-${Date.now()}@acme.com`,
            password: 'TestPassword123!',
            firstName: 'Bob',
            lastName: 'McFlows',
            organization: 'ACME'
        };

        const fillField = async (selector, value, fieldName) => {
            const field = await page.$(selector);
            if (!field) {
                throw new Error(`${fieldName} field not found`);
            }
            await field.click({ clickCount: 3 }); // select any existing content
            await field.type(value);
            console.log(`✓ ${fieldName} field filled`);
        };

        // --- Step 1: create the user account (allauth signup) ---
        await page.goto(`${BASE_URL}/accounts/signup/`, { waitUntil: 'networkidle2', timeout: 30000 });
        console.log('Signup page loaded successfully!');

        if (!(await page.$('form'))) {
            throw new Error('Signup form not found');
        }
        console.log('✓ Signup form found');

        console.log('Filling out signup form...');
        await fillField('#id_first_name', testData.firstName, 'First name');
        await fillField('#id_last_name', testData.lastName, 'Last name');
        await fillField('#id_email', testData.email, 'Email');
        await fillField('#id_password1', testData.password, 'Password');

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
            page.click('button[type="submit"]')
        ]);
        console.log('✓ Account signup submitted');

        // --- Step 2: confirm the email (mandatory verification logs the user in) ---
        const confirmPath = await getConfirmationPath();
        console.log(`✓ Found email confirmation link: ${confirmPath}`);
        await page.goto(`${BASE_URL}${confirmPath}`, { waitUntil: 'networkidle2', timeout: 30000 });
        console.log('✓ Email confirmed');

        // --- Step 3: create the workspace (separate page now) ---
        // a brand-new user with no workspace is routed here from /org/choose/
        await page.goto(`${BASE_URL}/org/choose/`, { waitUntil: 'networkidle2', timeout: 30000 });

        const workspace = await page.$('#id_name');
        if (!workspace) {
            throw new Error('Workspace field not found');
        }
        await workspace.click();
        await page.keyboard.type(testData.organization);
        // #id_name is a <temba-textinput> web component; make sure its value is set
        await page.$eval('#id_name', (el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }, testData.organization);
        console.log('✓ Workspace field filled');

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
            page.click('input[type="submit"], button[type="submit"]')
        ]);
        console.log('✓ Workspace created');

        // --- Step 4: confirm the app is usable ---
        await page.goto(`${BASE_URL}/flow/`, { waitUntil: 'networkidle2', timeout: 30000 });
        console.log('Flow list page loaded successfully');

        // --- Step 5: confirm the rapidpro -> mailroom -> elasticsearch search path works ---
        await checkContactSearchPipeline(page);

        console.log('✓ Test passed');

    } catch (error) {
        console.error('✗ Test failed:', error.message);

        try {
            if (page) {
                console.log('Current URL:', page.url());
                await page.screenshot({ path: 'test-failure.png', fullPage: true });
                console.log('Screenshot saved as test-failure.png');
            }
        } catch (screenshotError) {
            console.log('Could not save screenshot');
        }

        process.exit(1);
    } finally {
        await browser.close();
    }
})();
