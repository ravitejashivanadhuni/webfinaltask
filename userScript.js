document.addEventListener("DOMContentLoaded", () => {
    const appointmentForm = document.getElementById('appointment-form');
    const messageForm = document.getElementById('message-form');

    appointmentForm.addEventListener('submit', bookAppointment);
    messageForm.addEventListener('submit', sendMessage);

    async function bookAppointment(event) {
        event.preventDefault();
        const patientName = event.target.patientName.value;
        const date = event.target.date.value;
        const time = event.target.time.value;

        try {
            const response = await fetch('/api/book-appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ patientName, date, time })
            });

            if (response.ok) {
                alert('Appointment booked successfully!');
                // Optionally, update UI or perform other actions after successful booking
            } else {
                throw new Error('Failed to book appointment');
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            alert('An error occurred while booking the appointment. Please try again.');
        }
    }

    async function sendMessage(event) {
        event.preventDefault();
        const content = event.target.elements.message.value;

        // Example: replace with actual sender and recipient information
        const senderId = '60c72b2f9b1d4c47d0c12345'; // Should be dynamically set based on logged-in user
        const recipientId = '60c72b2f9b1d4c47d0c12346'; // Should be dynamically set based on recipient selection

        try {
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sender: senderId, recipient: recipientId, content })
            });

            if (response.ok) {
                alert('Message sent successfully!');
                // Optionally, update UI or perform other actions after successful message send
                event.target.reset(); // Clear the form
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('An error occurred while sending the message. Please try again.');
        }
    }
});
