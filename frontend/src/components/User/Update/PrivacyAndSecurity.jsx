import exportFromJSON from 'export-from-json';
import Dialog from '@mui/material/Dialog';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MoonLoader from "react-spinners/MoonLoader";
import { toast } from 'react-toastify';
import { clearErrors, deletePrivacyData, getPrivacyData, logoutUser } from '../../../actions/userAction';
import { BASE_PROFILE_IMAGE_URL } from '../../../utils/constants';
import MetaData from '../../Layouts/MetaData';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

const PrivacyAndSecurity = () => {
    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState("");
    const [confirmDeletionDialog, setConfirmDeletionDialog] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.user);
    const { error: profileError } = useSelector((state) => state.profile);
    const { loading, error: privacyError, data, accountDeleted } = useSelector((state) => state.privacy);

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setAvatar(user.avatar);
        }
        if (profileError) {
            toast.error(profileError);
            dispatch(clearErrors());
        }
    }, [dispatch, user, profileError]);

    useEffect(() => {
        if (!loading) {
            if (privacyError) {
                toast.error(privacyError);
                dispatch(clearErrors());
            } else if (data) {
                dispatch(clearErrors());
                const exportType = exportFromJSON.types.json
                const fileName = username + "_privacy_data"
                exportFromJSON({ data, fileName, exportType })
                dispatch(clearErrors());
            }
        }
    }, [dispatch, loading, data, privacyError]);

    useEffect(() => {
        if (accountDeleted) {
            dispatch(logoutUser());
            navigate("/login");
            toast.success("Account Deleted Successfully");
        }
    }, [accountDeleted, navigate]);

    const handleRequestPrivacyData = () => {
        dispatch(getPrivacyData());
    }

    const handleDeletePrivacyData = () => {
        setConfirmDeletionDialog(false);
        dispatch(deletePrivacyData());
    }

    const handleCloseDialog = () => {
        setConfirmDeletionDialog(false);
    }

    return (
        <>
            <Dialog open={confirmDeletionDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    Are you sure you want to delete your account?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will delete all your data and cannot be undone. You will be automatically logged out.
                        If you want a copy of your data, please download it before deleting your account.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleDeletePrivacyData} autoFocus>Confirm</Button>
                </DialogActions>
            </Dialog>
            <MetaData title="Privacy and Security" />
            <div className="flex flex-col gap-4 py-4 px-4 sm:py-10 sm:px-24 sm:w-3/4">
                <div className="flex items-center gap-8 ml-20">
                    <div className="w-11 h-11">
                        <img draggable="false" className="w-full h-full rounded-full border object-cover" src={BASE_PROFILE_IMAGE_URL + avatar} alt="avatar" />
                    </div>
                    <div className="flex flex-col gap-0">
                        <span className="text-xl">{username}</span>
                    </div>
                    <MoonLoader
                        color={"#000000"}
                        loading={loading ? 1 : 0}
                        size={20}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        speedMultiplier={0.65}
                    />
                </div>
                <div className="gap-8 items-center" style={{ marginLeft: 60, marginTop: 10 }}>
                    <div className="flex w-full gap-8 text-right items-center">
                        <button
                            className={`border rounded p-1 w-3/4 ${loading ? "text-gray-400" : "hover:bg-gray-50"}`}
                            onClick={handleRequestPrivacyData}
                            disabled={loading}
                        >
                            Download your information
                        </button>
                    </div>
                    <div style={{ marginTop: 10 }} />
                    <div>
                        <button
                            className={`border rounded p-1 w-3/4 ${loading ? "text-gray-400" : "hover:bg-gray-50"}`}
                            onClick={() => { setConfirmDeletionDialog(true) }}
                            disabled={loading}
                        >
                            Delete your account
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PrivacyAndSecurity