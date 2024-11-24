import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import styled, { css } from 'styled-components';
import { HTTP } from '../services/http.service';

const Container = styled.div`
  max-width: 500px;
  margin: 50px auto;
  padding: 20px;
  background-color: ${props => props.theme === 'light' ? '#fff' : '#1a1a1a'};
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  color: ${props => props.theme === 'light' ? '#333' : '#f0f0f0'};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const DropzoneArea = styled.div`
  border: 2px dashed ${props => props.theme === 'light' ? '#ccc' : '#555'};
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: border 0.3s ease, background-color 0.3s ease;

  ${(props) =>
    props.isDragActive &&
    css`
      border-color: #3498db;
      background-color: ${props.theme === 'light' ? '#ecf6fc' : '#2a2a2a'};
    `}

  &:hover {
    border-color: #3498db;
  }
`;

const UploadButton = styled.button`
  width: 100%;
  background-color: ${(props) => (props.disabled ? '#ccc' : '#3498db')};
  color: white;
  padding: 10px;
  border-radius: 5px;
  margin-top: 20px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.disabled ? '#ccc' : '#2980b9')};
  }
`;

const ProgressBar = styled.div`
  margin-top: 20px;
  background-color: #f3f3f3;
  border-radius: 5px;
  overflow: hidden;

  div {
    height: 10px;
    width: ${(props) => props.progress}%;
    background-color: #3498db;
    transition: width 0.3s ease;
  }
`;

const Heading = styled.h1`
  color: ${props => props.theme === 'light' ? '#333' : '#f0f0f0'};
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Dropdown = styled.select`
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: ${props => props.theme === 'light' ? '#fff' : '#333'};
  color: ${props => props.theme === 'light' ? '#333' : '#f0f0f0'};
  margin-bottom: 20px;
`;

export default function PhotoUploader() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');

  const maxFiles = 200;
  const maxSize = 100 * 1024 * 1024; // 100 MB per file

  // Fetch all events and their folders
  useEffect(() => {
    HTTP('get', '/events/all') // Replace with your backend endpoint
    .then(response => {
      setEvents(response.data);
      setSelectedEvent(response.data.length ? response.data[0]._id : ''); // Set the default event
      const firstFolderId = response.data[0]?.folders?.[0]?._id || ''; // Get the first folder's ID if it exists
  
      setSelectedFolder(firstFolderId);
    })
    .catch(error => console.error('Error fetching events:', error));
  }, []);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const validFiles = acceptedFiles.filter((file) => file.size <= maxSize);

      if (validFiles.length === 0) {
        setError('All files exceed the 100 MB size limit');
        setFiles([]);
        return;
      }

      if (validFiles.length + files.length > maxFiles) {
        setError(`You can only upload a maximum of ${maxFiles} files`);
        return;
      }

      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
      setError(null);
      setSuccess(false);
    },
    [files, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxSize,
    multiple: true,
    maxFiles,
  });

  const uploadPhotos = useCallback(async () => {
    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    if (!selectedEvent) {
      setError('Please select an event');
      return;
    }

    if (!selectedFolder) {
      setError('Please select a folder');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    files.forEach((file) => formData.append('photos', file));
    formData.append('eventId', selectedEvent);
    formData.append('folderId', selectedFolder);

    try {
      await HTTP('post', '/api/photos', formData, { 'Content-Type': 'multipart/form-data' }, null, {
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentage = Math.floor((loaded / total) * 100);
          setProgress(percentage);
        },
      });

      setSuccess(true);
      setUploading(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Upload failed. Please try again.');
      setUploading(false);
    }
  }, [files, selectedEvent, selectedFolder]);

  const handleEventChange = (e) => {
    const selectedEventId = e.target.value;
    setSelectedEvent(selectedEventId);
    
    // Get folders for the newly selected event
    const event = events.find(event => event._id === selectedEventId);
    const firstFolderId = event?.folders?.[0]?._id || ''; // Get the first folder's ID if it exists
    
    setSelectedFolder(firstFolderId); // Set the first folder as the default
  };

  // Get folders for the selected event
  const folders = events.find(event => event._id === selectedEvent)?.folders || [];

  return (
    <Container theme="dark">
      <Heading theme="dark">Photo Uploader</Heading>

      <Dropdown
        value={selectedEvent}
        onChange={handleEventChange}
        theme="dark"
      >
        <option value="" disabled>Select Event</option>
        {events.map((event) => (
          <option key={event._id} value={event._id}>
            {event.name}
          </option>
        ))}
      </Dropdown>

      <Dropdown
        value={selectedFolder}
        onChange={(e) => setSelectedFolder(e.target.value)}
        theme="dark"
        required
      >
        <option value="" disabled>Select Folder</option>
        {folders.map((folder) => (
          <option key={folder._id} value={folder._id}>
            {folder.name}
          </option>
        ))}
      </Dropdown>

      <DropzoneArea
        {...getRootProps()}
        isDragActive={isDragActive}
        theme="dark"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop your files here...</p>
        ) : (
          <p>Drag & drop your photos here, or click to select files</p>
        )}
        <p>(Up to {maxFiles} files, each less than 100MB)</p>
      </DropzoneArea>

      <UploadButton
        onClick={uploadPhotos}
        disabled={files.length === 0 || uploading || !selectedFolder}
      >
        {uploading ? 'Uploading...' : 'Upload Photos'}
      </UploadButton>

      {uploading && (
        <ProgressBar progress={progress}>
          <div></div>
          <p className="text-center mt-2">{progress}% Uploaded</p>
        </ProgressBar>
      )}

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '10px' }}>Upload completed successfully!</p>}
      {files.length > 0 && <p style={{ marginTop: '10px' }}>{files.length} file(s) selected</p>}
    </Container>
  );
}
