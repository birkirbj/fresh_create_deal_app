let contactData;
let contactEmail;

window.addEventListener('DOMContentLoaded', async () => {
    const createDealButton = document.getElementById('createDeal');
    createDealButton.addEventListener('click', createDeal);

    try {
        const client = await app.initialized();
        const data = await client.data.get('ticket');
        const ticketData = data.ticket;

        // Fetch and populate data when the page is loaded
        await fetchDataAndPopulateForm(client, ticketData);
    } catch (error) {
        console.error('An error occurred: ', error);
    }
});

async function fetchDataAndPopulateForm(client, ticketData) {
    try {
        const contactResponse = await client.request.invoke('getContactFromFreshdesk', { id: ticketData.requester_id });
        contactData = contactResponse.message;  // remove the let keyword
        contactEmail = contactData.email;  // remove the let keyword

        document.getElementById('ticketID').value = ticketData.id;
        document.getElementById('contactName').value = contactData.name;
        document.getElementById('contactEmail').value = contactEmail;
    } catch (error) {
        console.error('An error occurred while fetching contact details: ', error);
    }
}

async function createDeal() {
    console.log("createDeal function called");
    const createDealButton = document.getElementById('createDeal');
    createDealButton.textContent = "Creating...";
    createDealButton.disabled = true;

    try {
        const client = await app.initialized();
        const data = await client.data.get('ticket');
        const ticketData = data.ticket;

        // Removed the fetchDataAndPopulateForm function from here as the data is already fetched

        const response = await client.request.invoke('checkContactExists', { email: contactEmail }); // Use the global variable

        let contactExists = response.message;
        let contactId;

        if (!contactExists) {
            const contactCreateResponse = await client.request.invoke('createContactInFreshsales', {
                email: contactEmail, // Use the global variable
                name: contactData.name // Use the global variable
            });
            contactId = contactCreateResponse.message.contact.id;
        } else {
            contactId = contactExists.id;
        }

        let dealName = document.getElementById('dealName').value || `Deal for ticket #${ticketData.id}`;
        let dealAmount = document.getElementById('dealAmount').value || 0;
        let currency = document.getElementById('currency').value || 'ISK';

        const dealData = await client.request.invoke('createDealInFreshsales', {
            contact_id: contactId,
            name: dealName,
            amount: dealAmount,
            currency: currency
        });

        console.log('Deal created: ', dealData.message);

        createDealButton.textContent = "Deal Created!";
        createDealButton.classList.add("success");
    } catch (error) {
        console.error('An error occurred: ', error);
        createDealButton.textContent = "Create Deal";
        createDealButton.classList.add("error");
    } finally {
        createDealButton.disabled = false;
    }
}
