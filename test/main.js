const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting test...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        await page.goto('http://localhost/accounts/signup/', { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('Signup page loaded successfully!');

        // Check if signup form elements are present
        const signupForm = await page.$('form');
        if (signupForm) {
            console.log('✓ Signup form found');
        } else {
            throw new Error('Signup form not found');
        }

        // Helper function to fill form fields
        const fillField = async (selector, value, fieldName) => {
            const field = await page.$(selector);
            if (field) {
                await field.click({ clickCount: 3 }); // Clear any placeholder text
                await field.type(value);
                console.log(`✓ ${fieldName} field filled`);
            } else {
                throw new Error(`${fieldName} field not found`);
            }
        };

        // Helper function to click buttons
        const clickButton = async (selector, buttonName) => {
            const button = await page.$(selector);
            if (button) {
                await button.click();
                console.log(`✓ ${buttonName} button clicked`);
            } else {
                throw new Error(`${buttonName} button not found`);
            }
        };

        // Fill out the signup form
        console.log('Filling out signup form...');

        const testData = {
            email: `bob@acme.com`,
            password: 'TestPassword123!',
            firstName: 'Bob',
            lastName: 'McFlows',
            organization: 'ACME'
        };

        // Fill out the signup form fields
        await fillField('#id_first_name', testData.firstName, 'First name');
        await fillField('#id_last_name', testData.lastName, 'Last name');
        await fillField('#id_email', testData.email, 'Email');
        await fillField('#id_password1', testData.password, 'Password');
        await fillField('#id_name', testData.organization, 'Workspace');

        await clickButton('button[type="submit"]', 'Sign Up');

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });

        console.log('Submitted signup form');

        await page.goto('http://localhost/flow/', { waitUntil: 'networkidle2', timeout: 30000 });

        console.log('Flow list page loaded successfully');

    } catch (error) {
        console.error('✗ Test failed:', error.message);

        // Try to capture a screenshot for debugging
        try {
            await page.screenshot({ path: 'test-failure.png', fullPage: true });
            console.log('Screenshot saved as test-failure.png');
        } catch (screenshotError) {
            console.log('Could not save screenshot');
        }

        process.exit(1);
    } finally {
        await browser.close();
    }
})();