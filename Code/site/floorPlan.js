document.addEventListener('DOMContentLoaded', async function () {
    // Retrieve the event ID from localStorage
    const eventId = localStorage.getItem('selectedEventId'); // Get event ID from localStorage

    if (!eventId) {
        console.error('Event ID not found in localStorage.');
        return;
    }

    try {
        // Fetch the event data from the server
        const response = await fetch(`/events/${eventId}`);

        // Fetch the first qr code id from the event
        const qrCodeResponse = await fetch(`/first_qrcode/${eventId}`);

        if (!response.ok) {
            throw new Error(`Error fetching event: ${response.statusText}`);
        }

        const eventData = await response.json();

        // Find the div where the event map should be displayed
        const svgContainer = document.querySelector('.map-container');
        if (!svgContainer) {
            console.error('SVG container not found in the DOM.');
            return;
        }

        // Set the event map in the container
        svgContainer.innerHTML = `<img src="${eventData.events_map}" alt="Event Map">`;

        // Fetch the number of qr codes on the event
        const numberOfQrCodes = eventData.events_num_qrcodes;


        // Find the div where the checkboxes should be dynamically added
        const qrCheckboxesContainer = document.getElementById('qr-checkboxes');
        if (!qrCheckboxesContainer) {
            console.error('QR checkboxes container not found in the DOM.');
            return;
        }

        // Create checkboxes for all the QR codes
        for (let i = 1; i <= numberOfQrCodes; i++) {
            const label = document.createElement('label');
            label.htmlFor = `QrCode ${i}`;
            label.textContent = `QR Code ${i}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${qrCodeResponse + i}`;
            checkbox.name = `QrCode ${i}`;
            checkbox.value = `qr-${i}`;
            checkbox.classList.add('qr-checkbox');

            qrCheckboxesContainer.appendChild(label);
            qrCheckboxesContainer.appendChild(checkbox);
        }

    } catch (error) {
        console.error('Error fetching and displaying event map or QR codes:', error.message);
    }
});

// Get the selected checkboxes that is called when the button findPath is clicked
function getSelectedCheckboxes() {

    // Find the button that is clicked
    const findPathButton = document.getElementById('findPath');
    if (!findPathButton) {
        console.error('Find Path button not found in the DOM.');
        return;
    }

    // Add an event listener to the button
    findPathButton.addEventListener('click', function () {
        const qrCheckboxes = document.querySelectorAll('.qr-checkbox');
        qrCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                // Get the checked checkboxes
                const checkedCheckboxes = Array.from(qrCheckboxes).filter(checkbox => checkbox.checked);

                // Get the ids of the checked checkboxes
                const checkedIds = checkedCheckboxes.map(checkbox => checkbox.id);
            });
        });

        //Compare the ids on the string and get the qrcodes that have those ids
        let qrCodeDataString = [];
        for (let i = 0; i < checkedIds.length; i++) {
            fetch(`/lqrcodes/find_by_id/${checkedIds[i]}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error fetching QR code: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(qrCodeData => {
                    // Get the qr code data
                    const qrCodeX = qrCodeData.lqrcode_longitude;
                    const qrCodeY = qrCodeData.lqrcode_latitude;

                    // Put the qr code data in the query string
                    qrCodeDataString[i] = `${checkedIds[i]},${qrCodeX},${qrCodeY}`;

                })
        }

        //Fetch the svg map from the event
        fetch(`/events/${eventId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching event: ${response.statusText}`);
                }
                return response.json();
            })
            .then(eventData => {
                // Get the event map
                const eventSVG = eventData.events_svg;
            })

        // Get the qr code sequence
        async function getQrCodeSequence() {
            // Send the qrCodeDataString and eventSVG to the backend
            const pathData = {
                qrCodeDataString: qrCodeDataString,
                eventSVG: eventSVG
            };

            const response = await fetch('/find_path', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pathData)
            });

            if (!response.ok) {
                console.error('Error sending data to backend');
                return;
            }

            const result = await response.json();
            console.log('Received qr_sequence:', result.qr_sequence);

        }
        getQrCodeSequence();

    });
}
