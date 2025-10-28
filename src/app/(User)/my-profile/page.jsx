'use client';
import Button from '@/components/Button';
import DropDown from '@/components/DropDown';
import Input from '@/components/Input';
import PreferenceCard from '@/components/PreferenceCard';
import {
  ageRangeOptions,
  communicationStyleOptions,
  currentRoleOptions,
  genderOptions,
  preferencesOptions,
  vocabularyLevelOptions,
  vocabularyTopicOptions,
} from '@/constant/commonData';
import { Col, Radio, Row } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { Patch, Put } from '../../../Axios/AxiosFunctions';
import { apiHeader, BaseURL } from '../../../config/apiUrl';
import { updateUser } from '../../../store/auth/authSlice';
import { decryptToken } from '../../../config/helper';
import classes from './my-profile.module.css';

export default function MyProfile() {
  const { user, accessToken } = useSelector((state) => state?.authReducer);
  const encryptedToken = accessToken || Cookies.get('xpdx');
  const token = encryptedToken ? decryptToken(encryptedToken) : null;
  
  // If token decryption fails, try using the raw token from Redux
  const finalToken = token || accessToken;
  const { isSessionOpen } = useSelector((state) => state?.commonReducer);
  const router = useRouter();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');

  const [gender, setGender] = useState(
    genderOptions?.find((a) => a?.value == user?.gender) ?? null
  );

  const [currentRole, setCurrentRole] = useState(
    currentRoleOptions?.find((a) => a?.value == user?.currentRole) ?? null
  );
  const [vocabularyLevel, setVocabularyLevel] = useState(
    user?.vocabularyTopics?.reduce((acc, a) => {
      acc[a?.topic] = vocabularyLevelOptions?.find((e) => a?.level == e?.value);
      return acc;
    }, {})
  );
  const [vocabularyTopics, setVocabularyTopics] = useState(
    vocabularyTopicOptions
      ?.filter(
        (a) => user?.vocabularyTopics?.find((e) => e?.topic == a?.value) && a
      )
      ?.map((a) => a?.value)
      ?.slice(0, 1)
  );
  const [preferences, setPreferences] = useState(
    preferencesOptions?.find((e) => user?.preferences?.includes(e?.value)) ??
      null
  );
  // Removed professional background in favor of current role
  const [communicationStyle, setCommunicationStyle] = useState(
    communicationStyleOptions?.find(
      (e) => user?.communicationStyle === e?.value
    ) ?? null
  );

  const [age, setAge] = useState(
    ageRangeOptions?.find((e) => user?.age === e?.value) ?? null
  );

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const headers = apiHeader(finalToken);

  const handleUpdate = async () => {
    if (isSessionOpen) {
      return toast.error('You cannot update while session is open');
    }
    
    if (!finalToken) {
      return toast.error('Authentication token not found. Please login again.');
    }
    const selectedTopic = vocabularyTopics?.[0];
    const params = {
      firstName,
      lastName,
      gender: gender?.value,
      AiTeacher: preferences?.value, // Map preferences to AiTeacher
      age: age?.value,
      currentRole: currentRole?.value,
      speakingStyle: communicationStyle?.value, // Map communicationStyle to speakingStyle
      areaOfIntrest: selectedTopic, // Map vocabulary topic to areaOfIntrest
      vocabularyTopics:
        selectedTopic
          ? [
              {
                topic: selectedTopic,
                level: vocabularyLevel?.[selectedTopic]?.value,
              },
            ]
          : undefined,
    };
    if (selectedTopic) {
      if (!vocabularyLevel?.[selectedTopic]?.value) {
        return toast.error(
          `Please fill the (${vocabularyTopicOptions.find((a) => a?.value == selectedTopic)?.label}) Level field!`
        );
      }
    }

    const url = BaseURL('users/profile');
    console.log('Profile update request:', { url, params, headers, token: finalToken?.substring(0, 20) + '...' });
    setLoading(true);
    try {
      const response = await Put(url, params, headers);
      setLoading(false);

      if (response !== undefined) {
        const isProfile = user?.isProfileComplete;
        dispatch(updateUser(response?.data?.data?.user));
        if (!isProfile && response?.data?.data?.user?.isProfileComplete) {
          toast.success('Profile completed successfully');
          router?.push('/plans');
        } else {
          toast.success('Profile updated successfully');
        }
      }
    } catch (error) {
      setLoading(false);
      console.error('Profile update error:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    }
  };

  return (
    <>
      <div className={[classes.mainContainer, ' bg-inherit']}>
        <div className={[classes.innerContainer]}>
          <Row gutter={[30, 16]}>
            <Col xs={24}>
              <div className='flex items-center justify-between mb-1'>
                <h5 className='mb-0 dark:text-white'>My Profile</h5>
              </div>
              <p className='text-gray-600 dark:text-gray-300 mb-2'>
                Keep your details up-to-date to personalize your AI learning experience.
              </p>
            </Col>
            <Col xs={24}>
              <div className={classes.sectionCard}>
                <h6 className='mb-3 dark:text-white pb-2 border-b-2 border-[var(--primary-color)]'>
                  Personal Info
                </h6>
                <Row gutter={[30, 16]}>
            <Col md={12} xs={24}>
              <Input
                placeholder='Enter first name'
                value={firstName}
                setter={setFirstName}
                label={'First Name'}
                labelClassName={'!text-black dark:!text-white'}
              />
            </Col>

            <Col md={12} xs={24}>
              <Input
                placeholder='Enter last name'
                value={lastName}
                setter={setLastName}
                label={'Last Name'}
                labelClassName={'!text-black dark:!text-white'}
              />
            </Col>
            <Col md={12} xs={24}>
              <Input
                placeholder='Enter email'
                type='email'
                value={user?.email}
                setter={() => {}}
                label={'Email'}
                labelClassName={'!text-black dark:!text-white'}
                disabled={true}
              />
            </Col>
            <Col md={12} xs={24}>
              <DropDown
                placeholder='Select your gender'
                options={genderOptions}
                value={gender}
                setter={setGender}
                label={'Gender'}
                variant='web'
                labelClassName={'!text-black dark:!text-white'}
              />
            </Col>
            <Col md={12} xs={24}>
              <DropDown
                placeholder='Select your age'
                options={ageRangeOptions}
                value={age}
                setter={setAge}
                label={'Age'}
                variant='web'
                labelClassName={'!text-black dark:!text-white'}
              />
            </Col>
                </Row>
              </div>
            </Col>
            <Col xs={24} className='mt-4'>
              <div className={classes.sectionCard}>
                <h6 className='mb-3 dark:text-white pb-2 border-b-2 border-[var(--primary-color)]'>
                  Background Info
                </h6>
                <Row gutter={[30, 16]}>
                  <Col md={12} xs={24}>
                    <DropDown
                      placeholder='Select your current role'
                      options={currentRoleOptions}
                      value={currentRole}
                      setter={setCurrentRole}
                      label={'Current Role'}
                      variant='web'
                      labelClassName={'!text-black dark:!text-white'}
                    />
                  </Col>
                </Row>
              </div>
            </Col>
            <Col xs={24} className='mt-4'>
              <div className={classes.sectionCard}>
                <h6 className='mb-3 dark:text-white pb-2 border-b-2 border-[var(--primary-color)]'>
                  Let's Personalize Your AI Session
                </h6>
                <Row gutter={[30, 16]}>
                  <Col md={12} xs={24}>
                    <label className='block dark:text-white mb-2 font-[var(--archivo)] text-[16px]'>
                      Area of Interest (choose one)
                    </label>
                    <Radio.Group
                      options={vocabularyTopicOptions}
                      value={vocabularyTopics?.[0]}
                      onChange={(e) => {
                        setVocabularyTopics([e.target.value]);
                      }}
                    ></Radio.Group>
                  </Col>
                  <Col md={12} xs={24}>
                    {vocabularyTopics?.[0] && (
                      <div className='mb-4'>
                        <DropDown
                          placeholder={<>Select your current level</>}
                          options={vocabularyLevelOptions}
                          value={vocabularyLevel?.[vocabularyTopics?.[0]]}
                          setter={(e) =>
                            setVocabularyLevel((prev) => ({ ...prev, [vocabularyTopics?.[0]]: e }))
                          }
                          label={
                            <>
                              What is your current level of vocabulary as per CEFR self-assessment?
                            </>
                          }
                          variant='web'
                          labelClassName={'!text-black dark:!text-white'}
                        />
                        <p className='mt-1 text-sm text-gray-600 dark:text-gray-300'>
                          Please self-assess yourself using the CEFR self-assessment document provided.{' '}
                          <a
                            href='https://www.coe.int/en/web/common-european-framework-reference-languages/self-assessment-grid'
                            target='_blank'
                            rel='noreferrer'
                            className='text-[var(--primary-color)] underline'
                          >
                            Open CEFR self-assessment
                          </a>
                        </p>
                      </div>
                    )}
                  </Col>
                </Row>
              </div>
            </Col>
            <Col md={12} xs={24}>
              <DropDown
                placeholder='Select style of communication'
                options={communicationStyleOptions}
                value={communicationStyle}
                setter={setCommunicationStyle}
                label={'Preferred Speaking Style'}
                variant='web'
                labelClassName={'!text-black dark:!text-white'}
              />
            </Col>
            <Col xs={24}>
              <label className='dark:text-white mb-2 font-[var(--archivo)] text-[16px]'>
                Choose your AI Teacher:
              </label>
              <div className='flex flex-wrap gap-x-3 mt-2'>
                {preferencesOptions?.map((a) => (
                  <PreferenceCard
                    key={a?.value}
                    data={a}
                    preferences={preferences}
                    setPreferences={setPreferences}
                  />
                ))}
              </div>
            </Col>

            <Col xs={24} className='!flex justify-center mt-4'>
              <Button
                className={` min-w-[180px]`}
                label={
                  loading
                    ? user?.isProfileComplete
                      ? 'Updating...'
                      : 'Please wait...'
                    : user?.isProfileComplete
                    ? 'Update'
                    : 'Complete Profile'
                }
                onClick={handleUpdate}
                disabled={loading}
              />
            </Col>
          </Row>
        </div>
        {/* </div> */}
      </div>
    </>
  );
}
