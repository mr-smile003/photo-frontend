// Profile.js

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Instagram, Facebook, Youtube, Phone, Mail, Globe, FileImage, MessageCircle } from 'lucide-react';
import { HTTP } from '../services/http.service';

// Styled Components
const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  background-color: #2e2e2e;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.7);
  color: #f1f1f1;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  color: #ffffff;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 1.1rem;
  margin: 10px 0 5px;
  color: #b3b3b3;
`;

const IconInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: #404040;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 15px;
`;

const IconWrapper = styled.div`
  color: #8b8b8b;
  margin-right: 10px;
`;

const InputField = styled.input`
  flex: 1;
  background-color: transparent;
  border: none;
  color: #f1f1f1;
  font-size: 1rem;
  outline: none;

  &::placeholder {
    color: #8b8b8b;
  }
`;

const TextAreaField = styled.textarea`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 8px;
  background-color: #404040;
  color: #f1f1f1;
  border: none;
  font-size: 1rem;
  height: 80px;
  outline: none;

  &::placeholder {
    color: #8b8b8b;
  }
`;

const SubmitButton = styled.button`
  margin-top: 20px;
  padding: 12px 0;
  font-size: 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #218838;
  }
`;
const CancelButton = styled.button`
  margin-top: 10px;
  padding: 6px 12px;
  font-size: 0.9rem;
  background-color: #d9534f;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #c9302c;
  }
`;

const Profile = () => {
  const [userDetails, setUserDetails] = useState({
    backgroundPhoto: null,
    backgroundPhotoUrl: '', // Field to store the URL of the uploaded photo
    socialMedia: {
      whatsapp: '',
      facebook: '',
      instagram: '',
      youtube: ''
    },
    contactInfo: {
      phoneNumber: '',
      email: '',
      website: ''
    },
    extraDetails: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("socialMedia") || name.startsWith("contactInfo")) {
      const [section, field] = name.split('.');
      setUserDetails({
        ...userDetails,
        [section]: {
          ...userDetails[section],
          [field]: value
        }
      });
    } else {
      setUserDetails({
        ...userDetails,
        [name]: value
      });
    }
  };

  const handlePhotoUpload = (e) => {
    setUserDetails({
      ...userDetails,
      backgroundPhoto: e.target.files[0] // Set new photo
    });
  };

  const handleCancelBackgroundPhoto = () => {
    setUserDetails({
      ...userDetails,
      backgroundPhotoUrl: '', // Clear the background photo URL
      backgroundPhoto: null // Ensure no new photo is selected
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let backgroundPhotoUrl = userDetails.backgroundPhotoUrl;

      // If a new background photo is selected, upload it first
      if (userDetails.backgroundPhoto) {
        const formData = new FormData();
        formData.append('file', userDetails.backgroundPhoto);

        const uploadResponse = await HTTP('post', '/api/photos/upload', formData, { 'Content-Type': 'multipart/form-data' });
        backgroundPhotoUrl = uploadResponse.data.photoUrl; // Assume the response contains the photo URL
      }

      // Prepare the data payload, keeping the existing background photo URL if no new photo was uploaded
      const data = {
        id: '672e14f551b5c79fd60aef35', // example ID
        backgroundPhotoUrl, // Either new uploaded URL or existing one
        socialMedia: userDetails.socialMedia,
        contactInfo: userDetails.contactInfo,
        extraDetails: userDetails.extraDetails
      };
  
      // Submit the profile details
      await HTTP('post', '/users/update', data);
      alert('Details submitted successfully');
    } catch (error) {
      console.error('Error submitting details:', error);
      alert('Error submitting details');
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await HTTP('get', `/users/details?id=672db41751b5c79fd60aef1d`);
        
        if (response.data) {
          setUserDetails({
            ...userDetails,
            socialMedia: response.data.socialMedia,
            contactInfo: response.data.contactInfo,
            extraDetails: response.data.extraDetails,
            backgroundPhotoUrl: response.data.backgroundPhotoUrl // Load existing background photo URL
          });
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []); 
  

  return (
    <Container>
      <Title>Complete Your Profile</Title>
      <Form onSubmit={handleSubmit}>
        <Label>Background Photo</Label>
        <IconInputWrapper>
          <IconWrapper>
            <FileImage size={20} />
          </IconWrapper>
          {userDetails.backgroundPhotoUrl && !userDetails.backgroundPhoto ? (
            // Display the existing photo if available and no new photo is selected
            <div>
              <img src={userDetails.backgroundPhotoUrl} alt="Background" width="100%" style={{ borderRadius: '8px' }} />
              <CancelButton onClick={handleCancelBackgroundPhoto}>Remove Photo</CancelButton>
            </div>
          ) : (
            <InputField type="file" onChange={handlePhotoUpload} />
          )}
        </IconInputWrapper>

        <Label>Social Media</Label>
        <IconInputWrapper>
          <IconWrapper>
            <MessageCircle size={20} />
          </IconWrapper>
          <InputField
            type="text"
            name="socialMedia.whatsapp"
            placeholder="WhatsApp Link"
            value={userDetails.socialMedia.whatsapp}
            onChange={handleInputChange}
          />
        </IconInputWrapper>

        <IconInputWrapper>
          <IconWrapper>
            <Facebook size={20} />
          </IconWrapper>
          <InputField
            type="text"
            name="socialMedia.facebook"
            placeholder="Facebook Link"
            value={userDetails.socialMedia.facebook}
            onChange={handleInputChange}
          />
        </IconInputWrapper>

        <IconInputWrapper>
          <IconWrapper>
            <Instagram size={20} />
          </IconWrapper>
          <InputField
            type="text"
            name="socialMedia.instagram"
            placeholder="Instagram Link"
            value={userDetails.socialMedia.instagram}
            onChange={handleInputChange}
          />
        </IconInputWrapper>

        <IconInputWrapper>
          <IconWrapper>
            <Youtube size={20} />
          </IconWrapper>
          <InputField
            type="text"
            name="socialMedia.youtube"
            placeholder="YouTube Link"
            value={userDetails.socialMedia.youtube}
            onChange={handleInputChange}
          />
        </IconInputWrapper>

        <Label>Contact Information</Label>
        <IconInputWrapper>
          <IconWrapper>
            <Phone size={20} />
          </IconWrapper>
          <InputField
            type="text"
            name="contactInfo.phoneNumber"
            placeholder="Phone Number"
            value={userDetails.contactInfo.phoneNumber}
            onChange={handleInputChange}
          />
        </IconInputWrapper>

        <IconInputWrapper>
          <IconWrapper>
            <Mail size={20} />
          </IconWrapper>
          <InputField
            type="email"
            name="contactInfo.email"
            placeholder="Email"
            value={userDetails.contactInfo.email}
            onChange={handleInputChange}
          />
        </IconInputWrapper>

        <IconInputWrapper>
          <IconWrapper>
            <Globe size={20} />
          </IconWrapper>
          <InputField
            type="text"
            name="contactInfo.website"
            placeholder="Website"
            value={userDetails.contactInfo.website}
            onChange={handleInputChange}
          />
        </IconInputWrapper>

        <Label>Additional Details</Label>
        <TextAreaField
          name="extraDetails"
          placeholder="Extra Details"
          value={userDetails.extraDetails}
          onChange={handleInputChange}
        />

        <SubmitButton type="submit">Submit</SubmitButton>
      </Form>
    </Container>
  );
};

export default Profile;

