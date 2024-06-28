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
        const message = event.target.elements.message.value;
        const from = 'User';  // Example: replace with actual sender information if needed

        try {
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ from, content: message })
            });

            if (response.ok) {
                alert('Message sent successfully!');
                // Optionally, update UI or perform other actions after successful message send
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('An error occurred while sending the message. Please try again.');
        }
    }
});
