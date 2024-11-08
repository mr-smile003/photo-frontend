import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { HTTP } from '../services/http.service';

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #1a1a1a;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  color: #f0f0f0;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2rem;
  color: #f0f0f0;
`;

const CreateButton = styled.button`
  background-color: #007BFF;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin: 20px auto;
  display: block;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const EventGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const EventCard = styled(Link)`
  background-color: #2c2c2c;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  text-align: center;
`;

const EventName = styled.h3`
  color: #007BFF;
  font-size: 1.5rem;
`;

const EventDescription = styled.p`
  font-size: 1rem;
  color: #ddd;
`;

const EventDate = styled.p`
  font-size: 0.9rem;
  color: #999;
`;

const EditButton = styled.button`
  background-color: #ffc107;
  color: #000;
  padding: 8px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
`;

const CustomModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #2c2c2c;
  padding: 30px;
  border-radius: 10px;
  max-width: 500px;
  width: 100%;
  color: #f0f0f0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  position: absolute;
  top: 10px;
  right: 20px;
  cursor: pointer;
`;

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #333;
  border-radius: 5px;
  font-size: 1rem;
  background-color: #333;
  color: #f0f0f0;
`;

const TextAreaField = styled.textarea`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #333;
  border-radius: 5px;
  font-size: 1rem;
  height: 100px;
  background-color: #333;
  color: #f0f0f0;
`;

const SelectField = styled.select`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #333;
  border-radius: 5px;
  font-size: 1rem;
  background-color: #333;
  color: #f0f0f0;
`;

const SubmitButton = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #218838;
  }
`;

const Events = () => {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    date: '',
    file: null // New field for file input
  });

  useEffect(() => {
    HTTP('get', '/events/all')
    .then(response => setEvents(response.data))
    .catch(error => console.error('Error fetching events:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleFileChange = (e) => {
    setEventData({ ...eventData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      let photoUrl = null;
  
      // If a file exists, upload it to get the photo URL
      if (eventData.file) {
        const formData = new FormData();
        formData.append('file', eventData.file);
  
        const uploadResponse = await HTTP('post', '/api/photos/upload', formData, { 'Content-Type': 'multipart/form-data' }, null, {
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            console.log(`Upload progress: ${Math.floor((loaded / total) * 100)}%`);
          },
        });
        photoUrl = uploadResponse.data.photoUrl; // Adjust this based on the actual response structure
      }

      console.log(eventData, "eventData")
  
      // Build the JSON payload for creating the event
      const jsonPayload = {
        id: eventData?._id,
        name: eventData.name,
        description: eventData.description,
        date: eventData.date,
        eventPicture: photoUrl // Add the photo URL to the event payload
      };
  
      // Create or update the event with the photo URL
      if (isEditing) {
        await HTTP('post', '/events/update', jsonPayload, { 'Content-Type': 'application/json' });
        setEvents(events.map(event => (event._id === currentEventId ? { ...event, ...eventData, eventPicture: photoUrl } : event)));
        setIsEditing(false);
        setCurrentEventId(null);
      } else {
        const response = await HTTP('post', '/events/create', jsonPayload, { 'Content-Type': 'application/json' });
        setEvents([...events, response.data.event]);
      }
  
      setModalIsOpen(false);
      setEventData({ name: '', description: '', date: '', file: null });
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };
  
  

  const openEditModal = (event) => {
    setEventData({
      name: event.name,
      description: event.description,
      date: moment(event.date).format("YYYY-MM-DD"),
      file: null, // Reset file input during edit,
      _id: event._id,
      eventPicture: event.eventPicture
    });
    setCurrentEventId(event._id);
    setIsEditing(true);
    setModalIsOpen(true);
  };

  const openCreateModal = () => {
    setEventData({ name: '', description: '', date: '', file: null });
    setIsEditing(false);
    setModalIsOpen(true);
  };

  return (
    <Container>
      <Title>Events</Title>
      <CreateButton onClick={openCreateModal}>Create New Event</CreateButton>

      <EventGrid>
        {events.map(event => (
          <EventCard key={event._id} to={`/events/folders?eventId=${event._id}`}>
            <EventName>{event.name}</EventName>
            <EventDescription>{event.description}</EventDescription>
            <EventDate>{new Date(event.date).toLocaleDateString()}</EventDate>
            {event.eventPicture && <img src={`${event.eventPicture}`} alt={event.name} width="100%" />} {/* Display event picture */}
            <EditButton onClick={(e) => { e.preventDefault(); openEditModal(event); }}>Edit</EditButton>
          </EventCard>
        ))}
      </EventGrid>

      {modalIsOpen && (
        <CustomModalBackdrop>
          <ModalContent>
            <CloseButton onClick={() => setModalIsOpen(false)}>&times;</CloseButton>
            <h2>{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
            <form onSubmit={handleSubmit}>
              <InputField
                type="text"
                name="name"
                placeholder="Event Name"
                value={eventData.name}
                onChange={handleInputChange}
                required
              />
              <TextAreaField
                name="description"
                placeholder="Event Description"
                value={eventData.description}
                onChange={handleInputChange}
                required
              />
              <InputField
                type="date"
                name="date"
                value={moment(eventData.date).format("YYYY-MM-DD")}
                onChange={handleInputChange}
                required
              />
              <InputField
                type="file"
                name="file"
                onChange={handleFileChange} // Handle file input
              />
              <SubmitButton type="submit">{isEditing ? 'Update Event' : 'Create Event'}</SubmitButton>
            </form>
          </ModalContent>
        </CustomModalBackdrop>
      )}
    </Container>
  );
};

export default Events;
