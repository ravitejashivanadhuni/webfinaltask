document.addEventListener('DOMContentLoaded', () => {
    window.showPage = async (pageId) => {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.style.display = 'none');
        document.getElementById(pageId).style.display = 'block';

        switch (pageId) {
            case 'viewMessages':
                await fetchMessages();
                break;
            case 'manageAppointments':
                await fetchAppointments();
                break;
            case 'manageDoctors':
                // Optionally, fetch and display current doctors
                break;
            case 'manageAdmins':
                // Optionally, fetch and display current admins
                break;
            default:
                break;
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await fetch('/api/appointments');
            if (!response.ok) {
                throw new Error('Failed to fetch appointments: ' + response.statusText);
            }
            const appointments = await response.json();
            const appointmentsList = document.getElementById('appointments-list');
            appointmentsList.innerHTML = '';

            appointments.forEach(appointment => {
                const div = document.createElement('div');
                div.textContent = `Patient: ${appointment.patientName}, Date: ${appointment.date}, Time: ${appointment.time}`;
                const acceptButton = document.createElement('button');
                acceptButton.textContent = 'Accept';
                acceptButton.onclick = () => handleAppointment(appointment._id, 'accept');
                const rejectButton = document.createElement('button');
                rejectButton.textContent = 'Reject';
                rejectButton.onclick = () => handleAppointment(appointment._id, 'reject');
                div.appendChild(acceptButton);
                div.appendChild(rejectButton);
                appointmentsList.appendChild(div);
            });
        } catch (error) {
            console.error('Error fetching appointments:', error);
            alert('An error occurred while fetching appointments. Please try again.');
        }
    };

    const handleAppointment = async (id, action) => {
        try {
            const response = await fetch(`/api/appointments/${id}/${action}`, {
                method: 'PATCH'
            });
            if (!response.ok) {
                throw new Error(`Failed to ${action} appointment: ` + response.statusText);
            }
            alert(`Appointment ${action}ed successfully`);
            await fetchAppointments(); // Refresh the appointments list
        } catch (error) {
            console.error(`Error ${action}ing appointment:`, error);
            alert(`An error occurred while ${action}ing the appointment. Please try again.`);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch('/api/messages');
            if (!response.ok) {
                throw new Error('Failed to fetch messages: ' + response.statusText);
            }
            const messages = await response.json();
            const messagesList = document.getElementById('messages-list');
            messagesList.innerHTML = '';

            messages.forEach(message => {
                const div = document.createElement('div');
                div.textContent = `From: ${message.senderRole}, Content: ${message.content}`;
                messagesList.appendChild(div);
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
            alert('An error occurred while fetching messages. Please try again.');
        }
    };

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

            if (!response.ok) {
                throw new Error('Failed to add doctor: ' + response.statusText);
            }
            alert('Doctor added successfully');
            document.getElementById('add-doctor-form').reset();
            // Optionally, refresh the list of doctors
        } catch (error) {
            console.error('Error adding doctor:', error);
            alert('Error adding doctor. Please try again.');
        }
    });

    document.getElementById('remove-doctor-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('remove-doctor-email').value;

        try {
            const response = await fetch('/api/doctors', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error('Failed to remove doctor: ' + response.statusText);
            }
            alert('Doctor removed successfully');
            document.getElementById('remove-doctor-form').reset();
            // Optionally, refresh the list of doctors
        } catch (error) {
            console.error('Error removing doctor:', error);
            alert('Error removing doctor. Please try again.');
        }
    });

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

            if (!response.ok) {
                throw new Error('Failed to add admin: ' + response.statusText);
            }
            alert('Admin added successfully');
            document.getElementById('add-admin-form').reset();
            // Optionally, refresh the list of admins
        } catch (error) {
            console.error('Error adding admin:', error);
            alert('Error adding admin. Please try again.');
        }
    });

    document.getElementById('remove-admin-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('remove-admin-email').value;

        try {
            const response = await fetch('/api/admins', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error('Failed to remove admin: ' + response.statusText);
            }
            alert('Admin removed successfully');
            document.getElementById('remove-admin-form').reset();
            // Optionally, refresh the list of admins
        } catch (error) {
            console.error('Error removing admin:', error);
            alert('Error removing admin. Please try again.');
        }
    });
});
