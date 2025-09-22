import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import classes from './AreYouSureModal.module.css';
import Button from '@/components/Button';
import ModalSkeleton from '../ModalSkeleton';
const AreYouSureModal = ({ show, setShow, subTitle, onClick, isApiCall }) => {
  return (
    <>
      <ModalSkeleton show={show} setShow={setShow} contentClass='!px-0 pt-0'>
        <div className={classes?.modalHeader}>
          <div className={[classes.iconDiv].join(' ')}>
            <FiAlertTriangle size={'60px'} color={'var(--white-color)'} />
          </div>
          <h4 className={[classes.headingText].join(' ')}>Are You Sure</h4>
        </div>
        <div>
          <div className={classes.content}>
            <div className={classes.mainDiv}>
              <p className={[classes.message, 'dark:!text-white'].join(' ')}>
                {subTitle}
              </p>
            </div>
            <div className={classes.btnsBox}>
              <Button
                className={classes.yesBtn}
                label={isApiCall ? 'Wait' : 'Yes'}
                onClick={onClick}
                disabled={isApiCall}
              />
              <Button
                className={classes.noBtn}
                onClick={async () => {
                  setShow(false);
                }}
                disabled={isApiCall}
                label={'No'}
              />
            </div>
          </div>
        </div>
      </ModalSkeleton>
    </>
  );
};

export default AreYouSureModal;
