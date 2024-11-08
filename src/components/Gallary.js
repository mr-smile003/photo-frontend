import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { HTTP } from '../services/http.service';

const GalleryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  padding: 50px;
  background-color: #1a1a1a;
`;

const PhotoItem = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 10px;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
    cursor: pointer;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
`;

const ModalContent = styled.img`
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 50px;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  padding: 10px 20px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #444;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const PaginationButton = styled.button`
  padding: 10px 20px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #444;
  }
`;

const CountDisplay = styled.span`
  color: white;
  font-size: 16px;
`;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [page, setPage] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [totalPhotos, setTotalPhotos] = useState(0);

  const navigate = useNavigate();
  const query = useQuery();
  const eventId = query.get('eventId');
  const folderId = query.get('folderId');
  const limit = 30;

  const fetchPhotos = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await HTTP(
        'get',
        `/api/photos/event?eventId=${eventId}&folderId=${folderId}&skip=${page * limit}&limit=${limit}`
      );
      setPhotos(response.data.data);
      setTotalPhotos(response.data.totalCount); // Assuming API returns total count
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
    setIsFetching(false);
  }, [eventId, folderId, page]);

  useEffect(() => {
    if (eventId) fetchPhotos();
  }, [fetchPhotos, eventId, folderId]);

  const handleClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleClose = () => {
    setSelectedPhoto(null);
  };

  const goToPreviousPage = () => {
    if (page > 0) setPage((prevPage) => prevPage - 1);
  };

  const goToNextPage = () => {
    if ((page + 1) * limit < totalPhotos) setPage((prevPage) => prevPage + 1);
  };

  const jumpToLastPage = () => {
    setPage(Math.ceil(totalPhotos / limit) - 1); // Calculate the last page
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous location
  };

  return (
    <>
      <Header>
        <BackButton onClick={handleBack}>Back</BackButton>
        <Pagination>
          <PaginationButton onClick={goToPreviousPage} disabled={page === 0}>
            Previous
          </PaginationButton>
          <CountDisplay>
            Showing {(page * limit) + 1} - {(page * limit) + photos.length} of {totalPhotos} photos
          </CountDisplay>
          <PaginationButton onClick={goToNextPage} disabled={isFetching || photos.length < limit}>
            Next
          </PaginationButton>
          <PaginationButton onClick={jumpToLastPage} disabled={isFetching || (page + 1) * limit >= totalPhotos}>
            Jump to Last
          </PaginationButton>
        </Pagination>
      </Header>
      <GalleryContainer>
        {photos.map((photo) => (
          <PhotoItem key={photo._id} src={photo.url} alt="photo" onClick={() => handleClick(photo)} />
        ))}
      </GalleryContainer>
      {selectedPhoto && (
        <Modal onClick={handleClose}>
          <ModalContent src={selectedPhoto.url} alt="Selected" />
        </Modal>
      )}
    </>
  );
};

export default Gallery;
