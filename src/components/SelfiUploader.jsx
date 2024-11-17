import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { HTTP } from '../services/http.service';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 500px;
  margin: 50px auto;
  padding: 20px;
  background-color: #1a1a1a;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  color: #f0f0f0;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2rem;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  background-color: #333;
  color: #f0f0f0;
  border: 1px solid #444;
  border-radius: 5px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #007BFF;
  }
`;

const FileInput = styled.input`
  width: 100%;
  padding: 10px;
  background-color: #333;
  color: #f0f0f0;
  border: 1px solid #444;
  border-radius: 5px;
  cursor: pointer;

  &::file-selector-button {
    background-color: #007BFF;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 10px;
  }
`;

const SubmitButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #218838;
  }

  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  text-align: center;
  margin-top: 10px;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  text-align: center;
  margin-top: 10px;
`;

const SelfieUploader = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch events when component mounts
    HTTP('get', '/events/all')
      .then(response => {
        setEvents(response.data);
        if (response.data.length > 0) {
          setSelectedEvent(response.data[0]._id);
        }
      })
      .catch(error => {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
      });
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select an image file');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedEvent) {
      setError('Please select both an event and a file');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', selectedEvent);

    try {
      const response = await HTTP('post', '/api/photos/selfie', formData, {
        'Content-Type': 'multipart/form-data'
      });
      
      // Navigate to gallery with matchPersonId
      if (response.data.matchPersonId) {
        navigate(`/event-gallary?eventId=${selectedEvent}&matchPersonId=${response.data.matchPersonId}`);
      } else {
        setSuccess('Selfie uploaded successfully, but no matches found.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload selfie. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Container>
      <Title>Upload Selfie</Title>
      <Form onSubmit={handleSubmit}>
        <Select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          required
        >
          <option value="">Select Event</option>
          {events.map(event => (
            <option key={event._id} value={event._id}>
              {event.name}
            </option>
          ))}
        </Select>

        <FileInput
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
        />

        <SubmitButton type="submit" disabled={isUploading || !file || !selectedEvent}>
          {isUploading ? 'Uploading...' : 'Upload Selfie'}
        </SubmitButton>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
      </Form>
    </Container>
  );
};

export default SelfieUploader; 