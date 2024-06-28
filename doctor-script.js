document.addEventListener('DOMContentLoaded', () => {
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
                const appointmentItem = document.createElement('div');
                appointmentItem.classList.add('appointment-item');
                appointmentItem.innerHTML = `
                    <h3>Date: ${appointment.date}, Time: ${appointment.time}</h3>
                    <p>Patient: ${appointment.patientName}</p>
                `;
                appointmentsList.appendChild(appointmentItem);
            });
        } catch (error) {
            console.error('Error fetching appointments:', error);
            alert('An error occurred while fetching appointments. Please try again.');
        }
    };

    // Function to show appointments on page load or when link clicked
    window.showAppointments = fetchAppointments; // Expose as global function
});
