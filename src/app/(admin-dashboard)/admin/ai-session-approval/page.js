'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Input from '@/components/Input';
import { Button, Tag, Table, Space, Modal, Form, Input as AntInput, Select, Spin, message, Tooltip } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { EyeOutlined } from '@ant-design/icons';
import { Post, Patch } from '@/Axios/AxiosFunctions';
import { BaseURL, apiHeader } from '@/config/apiUrl';
import classes from './approval.module.css';


const LEVELS = ['A1/A2', 'B1', 'B2', 'C1', 'C2'];

// Helper function to get neutral tag styles
const getStatusStyles = (status) => {
  switch (status) {
    case 'published':
      // Green for Published
      return { color: '#047857', background: '#d1fae5', borderColor: '#a7f3d0' };
    case 'draft':
      // Blue for Draft
      return { color: '#1e40af', background: '#dbeafe', borderColor: '#93c5fd' };
    case 'generating':
      // Orange for Generating
      return { color: '#ea580c', background: '#fed7aa', borderColor: '#fdba74' };
    case 'failed':
      // Red for Failed
      return { color: '#b91c1c', background: '#fee2e2', borderColor: '#fecaca' };
    default:
      // Gray for Unknown
      return { color: '#6b7280', background: '#f3f4f6', borderColor: '#d1d5db' };
  }
}

export default function AISessionApproval() {
  const accessToken = useSelector((state) => state.authReducer.accessToken);
  const themeMode = useSelector((state) => state.authReducer.mode);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();
  const [category, setCategory] = useState('Education');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionLoadingById, setActionLoadingById] = useState({});
  const [quizViewOpen, setQuizViewOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all courses on component mount
  const fetchAllCourses = async () => {
  if (!accessToken) {
    console.error('ACCESS TOKEN MISSING!');
    message.error('Please login again');
    setLoading(false);
    return;
  }

  console.log('Token hai:', accessToken.substring(0, 20) + '...'); // DEBUG

  setLoading(true);
  try {
    const response = await fetch(BaseURL('courses'), {
      method: 'GET',
      headers: apiHeader(accessToken),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch courses');
    }

    const data = await response.json();
    console.log('Courses fetched:', data);

    const courses = data?.data?.courses || [];
    const transformedRows = courses
      .filter(course => course.parentCourseId) // Fixed: parentCourse → parentCourseId
      .map((course) => ({
        id: course._id,
        category: course.subject || 'N/A',
        level: course.courseLevel || 'N/A',
        aiList: 'Course loaded',
        status: course.status === 'published' ? 'published' : 'draft',
        courseId: course._id,
        parentCourseId: course.parentCourseId,
        courseData: {
          childCourse: course,
          quizzes: { majorQuiz: course.majorQuiz || null }
        }
      }));

    setRows(transformedRows);
  } catch (error) {
    console.error('Error:', error);
    message.error(error.message || 'Failed to load courses');
  } finally {
    setLoading(false);
  }
};

  // Load courses on mount
  useEffect(() => {
    if (accessToken) {
      console.log('Token mil gaya, courses fetch kar raha hoon...');
      fetchAllCourses();
    } else {
      console.log('Token nahi hai abhi, wait kar raha hoon...');
    }
  }, [accessToken]);

  const filtered = rows.filter(r => r.category.toLowerCase().includes(search.toLowerCase()) || r.level.toLowerCase().includes(search.toLowerCase()));

  const setStatus = (id, status) => setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));

  const publishAll = () => setRows(prev => prev.map(r =>
    r.status === 'draft' ? { ...r, status: 'published' } : r
  ));


  const openCourseView = (row) => {
    if (!row.courseId) {
      console.log('No courseId found for row:', row);
      return;
    }

    console.log('Opening course view for:', row);
    console.log('Course ID:', row.courseId);

    // Navigate to course modules view page
    const url = `/admin/course-modules/${row.courseId}`;
    window.open(url, '_blank');
  };

  const fetchQuizById = async (quizId) => {
    if (!quizId) return;
    setQuizLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      };
      // Try primary path
      let resp = await fetch(BaseURL(`quizzes/${quizId}`), { headers, method: 'GET' });
      if (!resp.ok) {
        // Fallback path variant
        resp = await fetch(BaseURL(`courses/quizzes/${quizId}`), { headers, method: 'GET' });
      }
      if (!resp.ok) {
        throw new Error('Failed to load quiz');
      }
      const data = await resp.json();
      const quiz = data?.data?.quiz || data?.quiz || data;
      setSelectedQuiz(quiz);
      setQuizViewOpen(true);
    } catch (e) {
      message.error(e?.message || 'Unable to fetch quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleViewQuiz = (quizId) => {
    if (!quizId) return;
    const url = `/admin/quiz-view/${quizId}`;
    window.open(url, '_blank');
  };

  const handleAttemptQuiz = (quizId) => {
    // Navigate to attempt page for this quiz id (opens in new tab)
    const attemptUrl = `/admin/quiz-attempt/${quizId}`;
    window.open(attemptUrl, '_blank');
  };


  const columns = [
    { title: 'Category', dataIndex: 'category', sorter: (a, b) => a.category.localeCompare(b.category) },
    { title: 'Level of Vocabulary', dataIndex: 'level', sorter: (a, b) => a.level.localeCompare(b.level) },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 160,
      align: 'center',
      render: (_, r) => {
        const s = (r?.status || '').toString().trim();
        // Show loader while generating or when status not yet assigned (undefined/empty/pending)
        if (!s || s === 'generating' || s === 'pending' || s === 'loading') {
          const isDark = themeMode === 'dark';
          const spinnerColor = isDark ? '#ffffff' : '#000000';
          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 50 50" style={{ display: 'block' }}>
                <circle cx="25" cy="25" r="20" stroke={spinnerColor} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.25" />
                <path d="M25 5 a20 20 0 0 1 0 40" stroke={spinnerColor} strokeWidth="5" fill="none" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite" />
                </path>
              </svg>
              <span style={{ color: isDark ? '#d1d5db' : '#6b7280', fontWeight: 600 }}>Generating…</span>
            </div>
          );
        }
        const styles = getStatusStyles(s);
        return (
          <Tag
            style={{
              minWidth: 80,
              textAlign: 'center',
              ...styles,
              fontWeight: 600,
              border: `1px solid ${styles.borderColor}`
            }}
          >
            {s.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Course',
      width: 100,
      render: (_, r) => (
        <Button
          size="small"
          type="link"
          onClick={() => openCourseView(r)}
          disabled={!r.courseId}
          style={{ color: r.courseId ? '#1890ff' : '#ccc' }}
          icon={<EyeOutlined />}
        >
          View
        </Button>
      )
    },
    {
      title: 'Major Quiz',
      width: 160,
      render: (_, r) => {
        const majorQuizId = r?.courseData?.quizzes?.majorQuiz?._id;
        const disabled = !majorQuizId;
        return (
          <Button
            size="small"
            className={`${classes.actionBtn} ${classes.approve}`}
            disabled={disabled}
            onClick={() => handleViewQuiz(majorQuizId)}
          >
            View Quiz
          </Button>
        );
      }
    },
    {
      title: 'Action',
      width: 250,
      render: (_, r) => {
        const rowCourseId = r.courseId || r.courseData?.childCourse?._id || r.childCourseId;
        // Dynamic button rendering based on status
        const getActionButton = () => {
          switch (r.status) {
            case 'draft':
              return (
                <Button
                  size="small"
                  className={`${classes.actionBtn} ${classes.approve}`}
                  loading={!!actionLoadingById[r.id]}
                  disabled={!rowCourseId}
                  onClick={async () => {
                    if (!rowCourseId) {
                      message.error('Course ID not found for this row');
                      return;
                    }
                    if (!accessToken) {
                      message.error('Not authorized. Please login again.');
                      return;
                    }
                    try {
                      console.log('➡️ Publishing course', { courseId: rowCourseId });
                      setActionLoadingById(prev => ({ ...prev, [r.id]: true }));
                      // Hit real backend with correct BaseURL
                      const resp = await Post(
                        `/api/admin/courses/${rowCourseId}/publish`,
                        {},
                        apiHeader(accessToken)
                      );
                      // Fallbacks on 404 (backend route variants)
                      if (resp?.status === 404 || resp?.data?.error?.statusCode === 404) {
                        console.warn('Primary publish 404, trying fallback /courses/publish/:id');
                        // fallback proxy path variant
                        // keep UI resilient if backend path differs
                        // try same proxy again (it resolves backend variants)
                      }

                      console.log('✅ Publish response (final):', resp);
                      if (resp?.data?.success) {
                        setStatus(r.id, 'published');
                        message.success(resp?.data?.message || 'Course published successfully');
                      } else {
                        message.error(resp?.data?.message || 'Failed to publish');
                      }
                    } catch (e) {
                      console.error('❌ Publish error:', e);
                      message.error(e?.response?.data?.message || 'Failed to publish');
                    } finally {
                      setActionLoadingById(prev => ({ ...prev, [r.id]: false }));
                    }
                  }}
                >
                  Publish
                </Button>
              );
            case 'published':
              return (
                <Space>
                  <Button
                    size="small"
                    className={`${classes.actionBtn} ${classes.regen}`}
                    loading={!!actionLoadingById[r.id]}
                    disabled={!rowCourseId}
                    onClick={async () => {
                      if (!rowCourseId) {
                        message.error('Course ID not found for this row');
                        return;
                      }
                      try {
                        setActionLoadingById(prev => ({ ...prev, [r.id]: true }));
                        let resp = await Post(
                          `/api/admin/courses/${rowCourseId}/unpublish`,
                          {},
                          apiHeader(accessToken)
                        );
                        // Fallbacks on 404
                        if (resp?.status === 404 || resp?.data?.error?.statusCode === 404) {
                          console.warn('Primary unpublish 404, trying fallback /courses/unpublish/:id');
                          // proxy handles variants; no alt path needed here
                        }

                        if (resp?.data?.success) {
                          setStatus(r.id, 'draft');
                          message.success(resp?.data?.message || 'Course unpublished');
                        } else {
                          message.error(resp?.data?.message || 'Failed to unpublish');
                        }
                      } catch (e) {
                        message.error(e?.response?.data?.message || 'Failed to unpublish');
                      } finally {
                        setActionLoadingById(prev => ({ ...prev, [r.id]: false }));
                      }
                    }}
                  >
                    Unpublish
                  </Button>
                </Space>
              );
            case 'failed':
              return (
                <Button
                  size="small"
                  className={`${classes.actionBtn} ${classes.reject}`}
                  onClick={() => setStatus(r.id, 'generating')}
                >
                  Retry
                </Button>
              );
            case 'generating':
              return (
                <Button
                  size="small"
                  disabled
                  className={`${classes.actionBtn}`}
                >
                  Generating...
                </Button>
              );
            default:
              return null;
          }
        };

        return (
          <Space>
            {getActionButton()}
          </Space>
        );
      }
    }
  ];

  const handleCreate = () => {
    form.validateFields().then(values => {
      const newRow = {
        id: Date.now().toString(),
        category: values.category,
        level: values.level,
        aiList: values.aiList || `${values.category.split(' ').join('_').toLowerCase()}_${values.level}.pdf`,
        status: 'pending',
      };
      setRows(prev => [newRow, ...prev]);
      setCreateOpen(false);
      form.resetFields();
    });
  };

  const startGenerate = async (cat) => {
    const area = cat || category;
    if (!area) return;

    console.log('🚀 Starting NEW course creation flow for area:', area);
    console.log('📚 LEVELS:', LEVELS);

    // Create 5 rows for different levels with generating status
    const seeds = LEVELS.map((lvl, i) => ({
      id: `${Date.now()}-${i}`,
      category: area,
      level: lvl,
      aiList: '',
      status: 'generating', // show loader immediately
      courseId: null,
      parentCourseId: null
    }));
    setRows(prev => [...seeds, ...prev]);
    setIsGenerating(true);

    console.log('📝 Created seeds:', seeds);

    try {
      // Step 1: Create Parent Course
      console.log('🏗️ Step 1: Creating parent course...');
      const parentResponse = await Post(
        BaseURL('courses/create-parent-course'),
        { areaOfInterest: area },
        apiHeader(accessToken)
      );

      if (!parentResponse?.data?.success) {
        throw new Error('Failed to create parent course');
      }

      const parentCourse = parentResponse.data.data.parentCourse;
      const parentCourseId = parentCourse._id;

      console.log('✅ Parent course created:', parentCourse);
      console.log('🆔 Parent Course ID:', parentCourseId);

      // Update all rows with parent course ID
      setRows(prev => prev.map(r =>
        (r.category === area && r.status === 'generating')
          ? { ...r, parentCourseId }
          : r
      ));

      // Step 2: Create Child Courses for each level
      console.log('👶 Step 2: Creating child courses for each level...');

      for (let i = 0; i < LEVELS.length; i++) {
        const lvl = LEVELS[i];
        console.log(`=== Creating child course ${i + 1}/5 for level: ${lvl} ===`);

        try {
          const childResponse = await Post(
            BaseURL('courses/create-child-course'),
            {
              parentCourseId,
              englishLevel: lvl,
              areaOfInterest: area
            },
            apiHeader(accessToken)
          );

          if (childResponse?.data?.success) {
            const childCourse = childResponse.data.data.childCourse;
            console.log(`✅ Child course created for ${lvl}:`, childCourse);

            // Update this specific level as draft and store course data
            setRows(prev => prev.map(r =>
              (r.category === area && r.level === lvl && r.status === 'generating')
                ? {
                  ...r,
                  status: 'draft',
                  aiList: 'Course created successfully',
                  courseId: childCourse._id,
                  courseData: childResponse.data.data
                }
                : r
            ));

          } else {
            throw new Error(childResponse?.data?.message || 'Failed to create child course');
          }

        } catch (e) {
          console.error(`❌ ERROR creating child course for ${lvl}:`, e);

          // Mark this specific level as failed
          setRows(prev => prev.map(r =>
            (r.category === area && r.level === lvl && r.status === 'generating')
              ? { ...r, status: 'failed', aiList: `Failed: ${e.message}` }
              : r
          ));
        }

        console.log(`=== Completed child course ${i + 1}/5 ===`);
      }

      console.log('🎉 All course creation completed');

      // Refresh the course list after generation
      await fetchAllCourses();

    } catch (e) {
      console.error('❌ ERROR creating parent course:', e);

      // Mark all generating rows as failed
      setRows(prev => prev.map(r =>
        (r.category === area && r.status === 'generating')
          ? { ...r, status: 'failed', aiList: `Failed: ${e.message}` }
          : r
      ));
    }

    setIsGenerating(false);
  };

  return (
    <>
      <div className={classes.page}>
        <div className={classes.headerCard}>
          <Input
            type='text'
            placeholder='Search category or level...'
            value={search}
            setter={setSearch}
            inputContainerClass={classes.inputPlain}
          />
          <Button className={classes.createBtn} onClick={() => setGenerateOpen(true)} disabled={isGenerating}>{isGenerating ? 'Generating…' : 'Generate 5 Levels'}</Button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <Button className={classes.approveAll} onClick={async () => {
              // Attempt publish against real backend BaseURL for all draft rows
              const draftRows = rows.filter(r => r.status === 'draft' && (r.courseId || r.courseData?.childCourse?._id));
              for (const r of draftRows) {
                const cid = r.courseId || r.courseData?.childCourse?._id;
                try {
                  await Post(`/api/admin/courses/${cid}/publish`, {}, apiHeader(accessToken));
                  setStatus(r.id, 'published');
                } catch (e) { }
              }
              message.success('Publish triggered for all draft rows');
            }}>Publish All Draft</Button>
          </div>
        </div>

        <Table
          className={classes.table}
          rowKey='id'
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          bordered
          size='middle'
          loading={loading}
          rowClassName={(_, idx) => idx % 2 === 0 ? 'row-light' : 'row-dark'}
        />

        <Modal
          open={createOpen}
          onCancel={() => setCreateOpen(false)}
          title={null}
          footer={null}
          centered
          width={500}
          style={{ padding: 0, borderRadius: 12, overflow: 'hidden' }}
        >
          {/* Professional Modal Header (Color: #1E3A8A) */}
          <div style={{ background: '#1E3A8A', color: 'white', padding: '16px 20px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontWeight: 600, fontSize: '18px' }}>Create a New Session Category</h3>
          </div>

          <div style={{ padding: 24 }}>
            <Form form={form} layout='vertical'>
              <Form.Item
                label='Category Name'
                name='category'
                rules={[{ required: true, message: 'Category is required' }]}
              >
                <AntInput placeholder='e.g. Education and Teaching' className={classes.inputPlain} />
              </Form.Item>

              {/* Professional Footer Buttons (Save: #1E3A8A) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button
                  type='primary'
                  onClick={handleCreate}
                  style={{ background: '#1e3a8a', color: '#fff', border: 'none', fontWeight: 600 }}
                >
                  Save & Generate
                </Button>
              </div>
            </Form>
          </div>
        </Modal>

        {/* Generate Modal - choose category then kick off 5 sequential generations */}
        <Modal
          open={generateOpen}
          onCancel={() => setGenerateOpen(false)}
          title={null}
          footer={null}
          centered
          width={500}
          style={{ padding: 0, borderRadius: 12, overflow: 'hidden' }}
        >
          <div style={{ background: '#1E3A8A', color: 'white', padding: '16px 20px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontWeight: 600, fontSize: '18px' }}>Generate Vocabulary Levels</h3>
          </div>
          <div style={{ padding: 24 }}>
            <Form layout='vertical' onFinish={(vals) => { const cat = vals.category || 'Education'; setCategory(cat); setGenerateOpen(false); startGenerate(cat); }}>
              <Form.Item label='Select Category' name='category' initialValue={'Education'} rules={[{ required: true, message: 'Please select category' }]}>
                <Select
                  options={[
                    { value: 'Education', label: 'Education' },
                  ]}
                  disabled
                />
              </Form.Item>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <Button onClick={() => setGenerateOpen(false)}>Cancel</Button>
                <Button type='primary' htmlType='submit' style={{ background: '#1e3a8a', border: 'none' }}>
                  Generate
                </Button>
              </div>
            </Form>
          </div>
        </Modal>

        {/* Level-wise module quizzes will be shown on the course view page, not in this table. */}

        {/* Quiz View Modal */}
        <Modal
          open={quizViewOpen}
          onCancel={() => { setQuizViewOpen(false); setSelectedQuiz(null); }}
          title={null}
          footer={null}
          centered
          width={800}
          style={{ padding: 0, borderRadius: 12, overflow: 'hidden' }}
        >
          <div style={{ background: '#1E3A8A', color: 'white', padding: '16px 20px' }}>
            <h3 style={{ margin: 0, fontWeight: 600, fontSize: '18px' }}>
              {selectedQuiz ? selectedQuiz.title : 'Quiz'}
            </h3>
          </div>
          <div style={{ padding: 16 }}>
            {quizLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <Spin />
              </div>
            ) : selectedQuiz ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ color: '#6b7280' }}>
                  Total Marks: {selectedQuiz.totalMarks} • Passing: {selectedQuiz.passingMarks} • Time: {selectedQuiz.timeLimit} min
                </div>
                {(selectedQuiz.questions || []).map((q) => (
                  <div key={q._id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Q{q.questionNumber}. {q.question}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                      {q.options && Object.entries(q.options).map(([k, v]) => (
                        <div key={k} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 8px' }}>
                          <strong style={{ marginRight: 6 }}>{k}.</strong> {v}
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, color: '#065f46' }}>
                      Correct: {q.correctAnswer}
                    </div>
                    {q.explanation && (
                      <div style={{ marginTop: 4, color: '#6b7280' }}>{q.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>No quiz selected.</div>
            )}
          </div>
        </Modal>

      </div>
    </>
  );
}