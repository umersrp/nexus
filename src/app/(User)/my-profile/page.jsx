'use client';
import Button from '@/components/Button';
import DropDown from '@/components/DropDown';
import Input from '@/components/Input';
import PreferenceCard from '@/components/PreferenceCard';
import {
  ageRangeOptions,
  communicationStyleOptions,
  educationOptions,
  genderOptions,
  preferencesOptions,
  professionalBackgroundOptions,
  vocabularyLevelOptions,
  vocabularyTopicOptions,
} from '@/constant/commonData';
import { Col, Radio, Row } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Patch } from '../../../Axios/AxiosFunctions';
import { apiHeader, BaseURL } from '../../../config/apiUrl';
import { updateUser } from '../../../store/auth/authSlice';
import classes from './my-profile.module.css';

export default function MyProfile() {
  const { user, accessToken } = useSelector((state) => state?.authReducer);
  const { isSessionOpen } = useSelector((state) => state?.commonReducer);
  const router = useRouter();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');

  const [gender, setGender] = useState(
    genderOptions?.find((a) => a?.value == user?.gender) ?? null
  );

  const [education, setEducation] = useState(
    educationOptions?.find((a) => a?.value == user?.education) ?? null
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
  );
  const [preferences, setPreferences] = useState(
    preferencesOptions?.find((e) => user?.preferences?.includes(e?.value)) ??
      null
  );
  const [professionalBackground, setProfessionalBackground] = useState(
    professionalBackgroundOptions?.find(
      (e) => user?.professionalBackground === e?.value
    ) ?? null
  );
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
  const headers = apiHeader(accessToken);

  const handleUpdate = async () => {
    if (isSessionOpen) {
      return toast.error('You cannot update while session is open');
    }
    const params = {
      firstName,
      lastName,
      gender: gender?.value,
      preferences: preferences?.value,
      age: age?.value,
      education: education?.value,
      professionalBackground: professionalBackground?.value,
      communicationStyle: communicationStyle?.value,
      vocabularyTopics:
        vocabularyTopics?.length == 0
          ? undefined
          : vocabularyTopics?.map((e) => ({
              topic: e,
              level: vocabularyLevel?.[e]?.value,
            })),
    };
    for (let key in vocabularyTopics) {
      if (!vocabularyLevel?.[vocabularyTopics?.[key]]?.value) {
        return toast.error(
          `Please fill the (${
            vocabularyTopicOptions.find(
              (a) => a?.value == vocabularyTopics?.[key]
            )?.label
          }) Level field!`
        );
      }
    }

    const url = BaseURL('auth/update-me');
    setLoading(true);
    const response = await Patch(url, params, headers);
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
  };

  return (
    <>
      <div className={[classes.mainContainer, ' bg-inherit']}>
        <div className={[classes.innerContainer]}>
          <Row gutter={[30, 16]}>
            <Col xs={24}>
              <h5 className='mb-0 dark:text-white'>My Profile</h5>
            </Col>
            <Col xs={24}>
              <h6 className='mb-0 dark:text-white text-center pb-3 border-b-2 border-[var(--primary-color)]'>
                Personal Info
              </h6>
            </Col>
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
            <Col xs={24} className='mt-4'>
              <h6 className='mb-0 dark:text-white text-center pb-3 border-b-2 border-[var(--primary-color)]'>
                Background Info
              </h6>
            </Col>

            <Col md={12} xs={24}>
              <DropDown
                placeholder='Select your educational background'
                options={educationOptions}
                value={education}
                setter={setEducation}
                label={'Educational Background'}
                variant='web'
                labelClassName={'!text-black dark:!text-white'}
              />
            </Col>
            <Col md={12} xs={24}>
              <DropDown
                placeholder='Select your professional background'
                options={professionalBackgroundOptions}
                value={professionalBackground}
                setter={setProfessionalBackground}
                label={'Professional Background'}
                variant='web'
                labelClassName={'!text-black dark:!text-white'}
                createAble
              />
            </Col>
            <Col xs={24} className='mt-4'>
              <h6 className='mb-0 dark:text-white text-center pb-3 border-b-2 border-[var(--primary-color)]'>
                Let's Personalize Your AI Session
              </h6>
            </Col>
            <Col md={12} xs={24}>
              <label className='block dark:text-white mb-2 font-[var(--archivo)] text-[16px]'>
                What subject or field do you want to enhance your vocabulary in?
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
              {vocabularyTopics?.map((a) => (
                <div className='mb-4'>
                  <DropDown
                    placeholder={<>Select your current level</>}
                    options={vocabularyLevelOptions}
                    value={vocabularyLevel?.[a]}
                    setter={(e) =>
                      setVocabularyLevel((prev) => ({ ...prev, [a]: e }))
                    }
                    label={
                      <>
                        What is your current level of vocabulary in{' '}
                        <b>
                          {
                            vocabularyTopicOptions?.find((b) => b?.value == a)
                              ?.label
                          }
                        </b>
                        ?
                      </>
                    }
                    variant='web'
                    labelClassName={'!text-black dark:!text-white'}
                  />
                </div>
              ))}
            </Col>
            <Col md={12} xs={24}>
              <DropDown
                placeholder='Select style of communication'
                options={communicationStyleOptions}
                value={communicationStyle}
                setter={setCommunicationStyle}
                label={'What style of communication do you want to practice?'}
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
