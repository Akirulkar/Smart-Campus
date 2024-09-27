document.getElementById('addEventButton')?.addEventListener('click', () => {
    document.getElementById('eventModal').style.display = 'block';
});

document.getElementById('saveEventButton')?.addEventListener('click', async () => {
    const eventName = document.getElementById('eventName').value;
    const eventDateTime = document.getElementById('eventDateTime').value;
    const eventLocation = document.getElementById('eventLocation').value;
    const eventDescription = document.getElementById('eventDescription').value;

    const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventName, eventDateTime, eventLocation, eventDescription }),
    });

    if (response.ok) {
        location.reload(); // Reload page to show the new event
    } else {
        alert('You are not authorized to add events.');
    }
});

document.getElementById('closeModalButton')?.addEventListener('click', () => {
    document.getElementById('eventModal').style.display = 'none';
});

async function deleteEvent(eventId) {
    const response = await fetch(/api/events/${eventId}, { method: 'DELETE' });
    if (response.ok) {
        location.reload(); // Reload page to reflect changes
    } else {
        alert('You are not authorized to delete events.');
    }
}