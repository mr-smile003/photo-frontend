import React, { useState, useEffect, useCallback } from 'react';
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

const PhotoWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
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

const ScanningOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(#03A9F4,#03A9F4), 
    linear-gradient(90deg, #ffffff33 1px,transparent 0,transparent 19px),
    linear-gradient(#ffffff33 1px,transparent 0,transparent 19px),
    linear-gradient(transparent, #2196f387);
  background-size: 100% 1.5%, 10% 100%, 100% 10%, 100% 100%;
  background-repeat: no-repeat, repeat, repeat, no-repeat;
  background-position: 0 0, 0 0, 0 0, 0 0;
  clip-path: polygon(0% 0%, 100% 0%, 100% 1.5%, 0% 1.5%);
  animation: scanningAnimation 2s infinite linear;
  pointer-events: none;

  @keyframes scanningAnimation {
    to {
      background-position: 0 100%, 0 0, 0 0, 0 0;
      clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
    }
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
  const [detectionStatus, setDetectionStatus] = useState({});

  const navigate = useNavigate();
  const query = useQuery();
  const eventId = query.get('eventId');
  const folderId = query.get('folderId');
  const matchPersonId = query.get('matchPersonId');
  const limit = 30;

  const fetchPhotos = useCallback(async () => {
    setIsFetching(true);
    try {
      let url = `/api/photos/event?eventNumber=${eventId}&skip=${page * limit}&limit=${limit}`;
      
      if (folderId) {
        url += `&folderId=${folderId}`;
      }
      
      if (matchPersonId) {
        url += `&matchPersonId=${matchPersonId}`;
      }

      const response = await HTTP('get', url);
      setPhotos(response.data.data);
      setTotalPhotos(response.data.totalCount);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
    setIsFetching(false);
  }, [eventId, folderId, matchPersonId, page]);

  const fetchDetectionStatus = useCallback(async () => {
    if (!photos.length) return;

    try {
      const statusPromises = photos.map(photo =>
        HTTP('get', `/api/photos/detection?photoId=${photo._id}&eventId=${eventId}`)
          .then(response => ({
            photoId: photo._id,
            isDetected: response.data.isDetected
          }))
          .catch(error => {
            console.error(`Error fetching detection status for photo ${photo._id}:`, error);
            return { photoId: photo._id, isDetected: null };
          })
      );

      const statuses = await Promise.all(statusPromises);
      const newDetectionStatus = {};
      statuses.forEach(status => {
        newDetectionStatus[status.photoId] = status.isDetected;
      });
      setDetectionStatus(newDetectionStatus);
    } catch (error) {
      console.error('Error fetching detection statuses:', error);
    }
  }, [photos, eventId]);

  useEffect(() => {
    if (eventId) fetchPhotos();
  }, [fetchPhotos, eventId]);

  // Effect for polling detection status every 5 seconds
  useEffect(() => {
    if (!photos.length) return;

    // Initial fetch
    fetchDetectionStatus();

    // Set up polling interval
    const intervalId = setInterval(fetchDetectionStatus, 10000);

    // Cleanup interval on unmount or when photos change
    return () => clearInterval(intervalId);
  }, [photos, fetchDetectionStatus]);

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
    setPage(Math.ceil(totalPhotos / limit) - 1);
  };

  const handleBack = () => {
    navigate(-1);
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
          <PhotoWrapper key={photo._id}>
            <PhotoItem 
              src={photo.url} 
              alt="photo" 
              onClick={() => handleClick(photo)} 
            />
            {detectionStatus[photo._id] === false && <ScanningOverlay />}
          </PhotoWrapper>
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
