import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { BASE_PROFILE_IMAGE_URL } from '../../../utils/constants';
import MetaData from '../../Layouts/MetaData';
import { clearErrors, getPrivacyData } from '../../../actions/userAction';
// import exportFromJSON from 'export-from-json';

const PrivacyAndSecurity = () => {
    const [username, setUsername] = useState("");
    const [avatar, setAvatar] = useState("");

    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.user);
    const { error: profileError } = useSelector((state) => state.profile);
    const { loading, error: privacyError, data } = useSelector((state) => state.privacy);

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
                console.log(data)
                dispatch(clearErrors());
                // const exportType = exportFromJSON.types.json
                // const fileName = username + "_privacy_data"
                // exportFromJSON({ privacyData, fileName, exportType })
                //     .then(() => {
                //         toast.success("Downloaded successfully");
                //     })
                //     .catch(() => {
                //         toast.error("Failed to download");
                //     })
                //     .finally(() => {
                //         dispatch(clearErrors());
                //     })
            }
        }
    }, [dispatch, loading, data, privacyError]);

    const handleRequestPrivacyData = () => {
        dispatch(getPrivacyData());
    }

    return (
        <>
            <MetaData title="Privacy and Security" />
            <div className="flex flex-col gap-4 py-4 px-4 sm:py-10 sm:px-24 sm:w-3/4">
                <div className="flex items-center gap-8 ml-20">
                    <div className="w-11 h-11">
                        <img draggable="false" className="w-full h-full rounded-full border object-cover" src={BASE_PROFILE_IMAGE_URL + avatar} alt="avatar" />
                    </div>
                    <div className="flex flex-col gap-0">
                        <span className="text-xl">{username}</span>
                    </div>
                </div>
                <div className="flex w-full gap-8 text-right items-center">
                    <span style={{ marginLeft: "4px" }} />
                    <button
                        className="border rounded p-1 w-3/4 hover:bg-gray-50"
                        onClick={handleRequestPrivacyData}
                    >
                        Download your information
                    </button>
                </div>
            </div>
        </>
    )
}

export default PrivacyAndSecurity