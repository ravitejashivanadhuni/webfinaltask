document.addEventListener('DOMContentLoaded', () => {
    // Function to handle form submission for adding a doctor
    document.getElementById('add-doctor-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('doctor-name').value;
        const email = document.getElementById('doctor-email').value;
        const password = document.getElementById('doctor-password').value;

        try {
            const response = await fetch('/api/add-doctor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            if (response.ok) {
                alert('Doctor added successfully');
                // Reset the form after successful submission
                document.getElementById('add-doctor-form').reset();
            } else {
                throw new Error('Failed to add doctor');
            }
        } catch (error) {
            console.error('Error adding doctor:', error);
            alert('Error adding doctor. Please try again.');
        }
    });

    // Function to handle form submission for adding an admin
    document.getElementById('add-admin-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('admin-name').value;
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;

        try {
            const response = await fetch('/api/add-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            if (response.ok) {
                alert('Admin added successfully');
                // Reset the form after successful submission
                document.getElementById('add-admin-form').reset();
            } else {
                throw new Error('Failed to add admin');
            }
        } catch (error) {
            console.error('Error adding admin:', error);
            alert('Error adding admin. Please try again.');
        }
    });

    // Function to switch between dashboard sections
    window.showPage = async (pageId) => {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.style.display = 'none');
        document.getElementById(pageId).style.display = 'block';

        switch (pageId) {
            case 'viewAppointments':
                await fetchAppointments();
                break;
            case 'viewMessages':
                await fetchMessages();
                break;
            default:
                break;
        }
    };

    // Fetch appointments from server
    const fetchAppointments = async () => {
        try {
            const response = await fetch('/api/appointments');
            if (!response.ok) {
                throw new Error('Failed to fetch appointments');
            }
            const appointments = await response.json();
            const appointmentsList = document.getElementById('appointments-list');
            appointmentsList.innerHTML = '';

            appointments.forEach(appointment => {
                const div = document.createElement('div');
                div.textContent = `Patient: ${appointment.patientName}, Date: ${appointment.date}, Time: ${appointment.time}`;
                appointmentsList.appendChild(div);
            });
        } catch (error) {
            console.error('Error fetching appointments:', error);
            alert('An error occurred while fetching appointments. Please try again.');
        }
    };

    // Fetch messages from server
    const fetchMessages = async () => {
        try {
            const response = await fetch('/api/messages');
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
            const messages = await response.json();
            const messagesList = document.getElementById('messages-list');
            messagesList.innerHTML = '';
    
            messages.forEach(message => {
                const div = document.createElement('div');
                div.textContent = `From: ${message.from}, Content: ${message.content}`;
                messagesList.appendChild(div);
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
            alert('An error occurred while fetching messages. Please try again.');
        }
    };

    // Initial load: Show viewAppointments section by default
    showPage('viewAppointments');
});
