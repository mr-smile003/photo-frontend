import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useQueryParam } from '../functions/common';
import { HTTP } from '../services/http.service';

// Styled components
const Container = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px;
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

const BackButton = styled.button`
  background-color: #333;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 20px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #444;
  }
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

const FolderGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const FolderCard = styled(Link)`
  background-color: #2c2c2c;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
  text-align: center;
  text-decoration: none;
`;

const FolderName = styled.h3`
  color: #007BFF;
  font-size: 1.5rem;
`;

const FolderDescription = styled.p`
  font-size: 1rem;
  color: #ddd;
`;

const FolderDate = styled.p`
  font-size: 0.9rem;
  color: #999;
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

const EventFolders = () => {
  const navigate = useNavigate();
  const eventId = useQueryParam('eventId');
  const [folders, setFolders] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [folderData, setFolderData] = useState({
    name: '',
    description: '',
    date: '',
    file: null
  });

  useEffect(() => {
    HTTP('get', `/folders/all?eventId=${eventId}`)
    .then(response => setFolders(response.data))
    .catch(error => console.error('Error fetching folders:', error));
  }, [eventId]);

  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFolderData({ ...folderData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFolderData({ ...folderData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let folderPictureUrl = null;

      if (folderData.file) {
        const formData = new FormData();
        formData.append('file', folderData.file);

        const uploadResponse = await HTTP('post', '/api/photos/upload', formData, { 'Content-Type': 'multipart/form-data' }, null, {
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            console.log(`Upload progress: ${Math.floor((loaded / total) * 100)}%`);
          },
        });
        folderPictureUrl = uploadResponse.data.photoUrl; 
      }

      const jsonPayload = {
        name: folderData.name,
        description: folderData.description,
        date: folderData.date,
        eventId: eventId,
        folderPicture: folderPictureUrl
      };

      const response = await HTTP('post', '/folders/create', jsonPayload, { 'Content-Type': 'application/json' });
      setFolders([...folders, response.data.folder]);

      setModalIsOpen(false);
      setFolderData({ name: '', description: '', date: '', file: null });
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const openCreateModal = () => {
    setFolderData({ name: '', description: '', date: '', file: null });
    setModalIsOpen(true);
  };

  return (
    <Container>
      <BackButton onClick={handleBack}>Back</BackButton>
      <Title>Folders</Title>
      <CreateButton onClick={openCreateModal}>Create New Folder</CreateButton>

      <FolderGrid>
        {folders.map(folder => (
          <FolderCard key={folder._id} to={`/event-gallary?eventId=${eventId}&folderId=${folder?._id}`}>
            <FolderName>{folder.name}</FolderName>
            <FolderDescription>{folder.description}</FolderDescription>
            <FolderDate>{moment(folder.date).format("YYYY-MM-DD")}</FolderDate>
            {folder.folderPicture && <img src={folder.folderPicture} alt={folder.name} width="100%" />}
          </FolderCard>
        ))}
      </FolderGrid>

      {modalIsOpen && (
        <CustomModalBackdrop>
          <ModalContent>
            <CloseButton onClick={() => setModalIsOpen(false)}>&times;</CloseButton>
            <h2>Create New Folder</h2>
            <form onSubmit={handleSubmit}>
              <InputField
                type="text"
                name="name"
                placeholder="Folder Name"
                value={folderData.name}
                onChange={handleInputChange}
                required
              />
              <TextAreaField
                name="description"
                placeholder="Folder Description"
                value={folderData.description}
                onChange={handleInputChange}
                required
              />
              <InputField
                type="date"
                name="date"
                value={folderData.date}
                onChange={handleInputChange}
                required
              />
              <InputField
                type="file"
                name="file"
                onChange={handleFileChange}
              />
              <SubmitButton type="submit">Create Folder</SubmitButton>
            </form>
          </ModalContent>
        </CustomModalBackdrop>
      )}
    </Container>
  );
};

export default EventFolders;
