'use client';
import { Delete, Patch, Post, Get } from '@/Axios/AxiosFunctions';
import DropDown from '@/components/DropDown';
import IconBtn from '@/components/IconBtn';
import Input from '@/components/Input';
import TableComponent from '@/components/TableComponent';
import { apiHeader, BaseURL, recordsLimit } from '@/config/apiUrl';
import { userStatusOptions } from '@/constant/commonData';
import useDebounce from '@/custom-hooks/useDebounce';
import AreYouSureModal from '@/modals/AreYouSureModal';
import ViewAdminModal from '@/modals/ViewAdminModal/ViewAdminModal';
import CreateAdminModal from '@/modals/CreateAdminModal/CreateAdminModal';
import { Button } from 'antd';
import SessionSettingsModal from '@/modals/SessionSettingsModal';
import { useEffect, useMemo, useState } from 'react';
import { AiFillDelete, AiFillEye, AiOutlinePlus } from 'react-icons/ai';
import { UserOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import classes from './administrator.module.css';
import Cookies from 'js-cookie';
import { decryptToken } from '@/config/helper';

const Administrator = () => {
    // const accessToken = useSelector((state) => state.authReducer?.accessToken || state.auth?.accessToken || undefined);
    const [responseData, setResponseData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState('');
    const [status, setStatus] = useState(userStatusOptions[0]);
    const [sessionSettings, setSessionSettings] = useState({ duration: 30, allowPauseResume: true, allowStop: true });

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const debounceSearch = useDebounce(search, 500);

    const authToken = typeof window !== 'undefined'
        ? (() => {
            const cookieEnc = Cookies.get('xpdx');
            const cookieRaw = Cookies.get('token');
            const lsToken = localStorage.getItem('token');
            const decrypted = cookieEnc ? decryptToken(cookieEnc) : null;
            // Prefer decrypted cookie, then raw cookie, then redux token, then localStorage
            return decrypted || cookieRaw || undefined || lsToken;
        })()
        : undefined;

    useEffect(() => {
        getAllData(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounceSearch, status, page]);

    const getAllData = async (pageNo) => {
        try {
            setLoading(true);
            const statusKey = (status?.value || status?.label || '').toString().toLowerCase();
            const isActiveParam = statusKey === 'active' ? 'true' : statusKey === 'deactive' ? 'false' : undefined;

            const params = new URLSearchParams();
            params.set('page', String(pageNo || 1));
            params.set('limit', String(recordsLimit || 10));
            // cache-buster to avoid 304 with stale table data
            params.set('_ts', Date.now().toString());
            if (typeof debounceSearch === 'string' && debounceSearch.trim().length > 0) {
                params.set('search', debounceSearch.trim());
            }
            if (isActiveParam !== undefined) {
                params.set('isActive', isActiveParam);
            }

            const url = BaseURL(`admin/list?${params.toString()}`);
            const res = await Get(url, authToken, true);

            const items =
                res?.data?.data?.admins
                || res?.data?.admins
                || res?.data?.data?.items
                || res?.data?.data?.docs
                || res?.data?.data?.results
                || res?.data?.results
                || [];
            const totalPagesFromApi =
                res?.data?.data?.pagination?.totalPages
                || res?.data?.pagination?.totalPages
                || res?.data?.data?.totalPages
                || res?.data?.totalPages
                || res?.data?.meta?.totalPages
                || 1;

            const normalizedItems = (Array.isArray(items) ? items : []).map((row) => {
                const derivedStatus = row?.status || (row?.isActive === true ? 'active' : row?.isActive === false ? 'deactive' : 'pending');
                return { ...row, status: derivedStatus };
            });
            setResponseData(normalizedItems);
            setTotalPages(Number(totalPagesFromApi) > 0 ? Number(totalPagesFromApi) : 1);
        } catch (e) {
            // errors toasts handled in AxiosFunctions
        } finally {
            setLoading(false);
        }
    };

    const selectedStatusKey = (status?.value || status?.label || '').toString().toLowerCase();

    const filteredData = responseData;

    const totalCount = filteredData.length;
    const getRowStatus = (a) => a?.status || (a?.isActive === true ? 'active' : a?.isActive === false ? 'deactive' : 'pending');
    const activeCount = filteredData.filter(a => ['active', 'approved'].includes(getRowStatus(a))).length;
    const inactiveCount = filteredData.filter(a => ['deactive', 'rejected'].includes(getRowStatus(a))).length;

    const totalPagesCalc = totalPages;
    const paginatedData = filteredData;

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            render: (text, record) => {
                return (
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base">
                            {record?.firstName?.charAt(0)}{record?.lastName?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 text-base">{`${record?.firstName} ${record?.lastName}`}</span>
                            <span className="text-gray-600 text-sm">{record?.email}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Role',
            dataIndex: 'role',
            render: (text) => {
                return (
                    <span className="text-base text-gray-700 font-medium">{text}</span>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (text) => {
                const statusMap = {
                    active: { cls: `${classes.statusBadge} ${classes.success}`, label: 'Active' },
                    approved: { cls: `${classes.statusBadge} ${classes.success}`, label: 'Approved' },
                    pending: { cls: `${classes.statusBadge} ${classes.warning}`, label: 'Pending' },
                    rejected: { cls: `${classes.statusBadge} ${classes.danger}`, label: 'Rejected' },
                    deactive: { cls: `${classes.statusBadge} ${classes.warning}`, label: 'Inactive' },
                };
                const config = statusMap[text] || statusMap.pending;
                return (
                    <span className={config.cls}>{config.label}</span>
                );
            },
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            render: (text, record) => {
                return (
                    <div className="flex gap-3 justify-start">
                        <IconBtn
                            icon={<AiFillEye className="text-blue-500 text-lg" />}
                            onClick={() => {
                                setSelectedItem(record);
                                setShowModal('view');
                            }}
                            title='View'
                            className="icon-btn"
                        />
                        {!['pending', 'rejected'].includes(record?.status) && (
                            <IconBtn
                                icon={[
                                    'approved', 'active'
                                ]?.includes(record?.status)
                                    ? (<FaLock className="text-orange-500 text-lg" />) // active -> lock (deactivate)
                                    : (<FaUnlock className="text-green-500 text-lg" />) // inactive -> unlock (activate)
                                }
                                onClick={() => {
                                    setSelectedItem(record);
                                    setShowModal('status');
                                }}
                                title={
                                    ['approved', 'active']?.includes(record?.status)
                                        ? 'Deactivate'
                                        : 'Activate'
                                }
                                className="icon-btn"
                            />
                        )}
                        <IconBtn
                            icon={<AiFillDelete className="text-red-500 text-lg" />}
                            onClick={() => {
                                setSelectedItem(record);
                                setShowModal('delete');
                            }}
                            title='Delete'
                            className="icon-btn"
                        />
                    </div>
                );
            },
        },
    ];

    const handleUpdateStatus = async () => {
        if (!selectedItem?._id) return;
        try {
            setSubmitLoading('update');
            const isCurrentlyActive = ['approved', 'active']?.includes(selectedItem?.status);
            const action = isCurrentlyActive ? 'deactivate' : 'activate';
            // Use proxy to bypass CORS for PATCH
            const url = `/api/admin/admins/${selectedItem?._id}/${action}`;
            await Post(url, {}, apiHeader(authToken));
            toast.success(`Admin has been ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully!`);
            setShowModal('');
            setSelectedItem(null);
            await getAllData(page);
        } catch (e) {
            // toast handled in AxiosFunctions
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedItem?._id) return;
        try {
            setSubmitLoading('delete');
            const url = BaseURL(`admin/${selectedItem?._id}`);
            await Delete(url, null, authToken);
            toast.success('Admin has been deleted successfully!');
            setShowModal('');
            setSelectedItem(null);
            await getAllData(page);
        } catch (e) {
            // toast handled in AxiosFunctions
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCreateAdmin = async (adminData) => {
        try {
            setSubmitLoading('create');
            const roleValue = adminData?.role?.value || adminData?.role;
            const permissionName = `${adminData?.firstName || 'Admin'} ${adminData?.lastName || ''}`.trim() + `_permission_${Date.now()}`;
            const payload = {
                firstName: adminData?.firstName,
                lastName: adminData?.lastName,
                email: adminData?.email,
                role: roleValue,
                // Backend expects either permissionId or a 'permission' object
                permission: {
                    name: permissionName,
                    description: `Auto-generated permission for ${adminData?.firstName || ''} ${adminData?.lastName || ''}`.trim(),
                    ...adminData?.permissions,
                },
            };
            const url = BaseURL('admin/create');
            await Post(url, payload, apiHeader(authToken));
            toast.success('Admin created successfully!');
            setShowModal('');
            // refresh list on current page (or go to first page)
            setPage(1);
            await getAllData(1);
        } catch (e) {
            // toast handled by AxiosFunctions
        } finally {
            setSubmitLoading(false);
        }
    };

    

    return (
        <div className={classes.mainContainer}>
            <div className={classes.headingContainer}>
                <div className={classes.headerContent}>
                    <div className={classes.titleSection}>
                        <h1 className={classes.pageTitle}>Administrator Management</h1>
                        <p className={classes.pageSubtitle}>Manage admin users and their permissions</p>
                    </div>
                    <div className={classes.controlsSection}>
                        <div className={classes.searchContainer}>
                            <Input
                                type={'text'}
                                placeholder={`Search by name or email...`}
                                value={search}
                                setter={setSearch}
                                inputContainerClass={classes.inputPlain}
                            />
                        </div>
                        <div className={classes.actionsContainer}>
                            <DropDown
                                options={userStatusOptions}
                                placeholder='All Status'
                                onChange={(e) => setStatus(e)}
                                value={status}
                                variant='web'
                                customStyle={{
                                    width: '180px',
                                    background: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                    borderRadius: '8px',
                                    minHeight: '40px'
                                }}
                                isSearchable
                                label={undefined}
                                containerClass=''
                            />
                            <Button
                                type="primary"
                                icon={<AiOutlinePlus />}
                                onClick={() => setShowModal('create')}
                                className={classes.createBtn}
                                size="middle"
                            >
                                Create Admin
                            </Button>
                            
                            {/* Session settings moved to Sessions page */}
                        </div>
                    </div>
                </div>
            </div>

            <div className={classes.statsContainer}>
                <div className={`${classes.statCard} ${classes.cardGreen}`}>
                    <div className={classes.statContent}>
                        <span className={classes.statLabel}>Total Admins</span>
                        <span className={classes.statNumber}>{totalCount}</span>
                    </div>
                    <div className={`${classes.statIconBadge} ${classes.badgeGreen}`}>
                        <UserOutlined />
                    </div>
                </div>
                <div className={`${classes.statCard} ${classes.cardBlue}`}>
                    <div className={classes.statContent}>
                        <span className={classes.statLabel}>Active</span>
                        <span className={classes.statNumber}>{activeCount}</span>
                    </div>
                    <div className={`${classes.statIconBadge} ${classes.badgeBlue}`}>
                        <CheckCircleFilled />
                    </div>
                </div>
                <div className={`${classes.statCard} ${classes.cardOrange}`}>
                    <div className={classes.statContent}>
                        <span className={classes.statLabel}>Inactive</span>
                        <span className={classes.statNumber}>{inactiveCount}</span>
                    </div>
                    <div className={`${classes.statIconBadge} ${classes.badgeOrange}`}>
                        <CloseCircleFilled />
                    </div>
                </div>
            </div>

            <div className={classes.tableWrapper}>
                <TableComponent
                    columns={columns}
                    data={paginatedData}
                    isLoading={loading}
                    className={classes.table}
                    page={page}
                    totalPages={totalPagesCalc}
                    onPageChange={(e) => {
                        setPage(e);
                    }}
                />
            </div>

            <ViewAdminModal
                show={showModal == 'view'}
                onClose={() => {
                    setShowModal('');
                    setSelectedItem(null);
                }}
                data={selectedItem}
            />

            <CreateAdminModal
                show={showModal == 'create'}
                onClose={() => {
                    setShowModal('');
                }}
                onSubmit={handleCreateAdmin}
                loading={submitLoading == 'create'}
            />

            <AreYouSureModal
                show={showModal == 'status'}
                setShow={setShowModal}
                subTitle={`Do you really want to ${['active', 'approved'].includes(selectedItem?.status)
                    ? 'deactivate'
                    : 'activate'
                    } this admin?`}
                onClick={handleUpdateStatus}
                isApiCall={submitLoading == 'update'}
            />

            <SessionSettingsModal
                open={showModal == 'sessionSettings'}
                onClose={() => setShowModal('')}
                initial={sessionSettings}
                onSave={(val) => {
                    setSessionSettings(val);
                    setShowModal('');
                    toast.success('Session settings updated');
                }}
            />

            <AreYouSureModal
                show={showModal == 'delete'}
                setShow={setShowModal}
                subTitle={`Do you really want to Delete this Admin?`}
                onClick={handleDelete}
                isApiCall={submitLoading == 'delete'}
            />
        </div>
    );
};

export default Administrator;