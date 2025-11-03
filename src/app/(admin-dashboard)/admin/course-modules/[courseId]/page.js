  'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Button, Table, Space, Modal, Form, Input, Select, message, Spin, Card, Row, Col, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { Get, Post, Put, Delete } from '@/Axios/AxiosFunctions';
import { BaseURL, apiHeader } from '@/config/apiUrl';
import classes from '../course-modules.module.css';

export default function CourseModules() {
  const params = useParams();
  const courseId = params.courseId;
  const accessToken = useSelector((state) => state.authReducer.accessToken);
  const authState = useSelector((state) => state.authReducer);
  
  console.log('🔍 Auth State:', authState);
  console.log('🔑 Access Token from Redux:', accessToken);
  
  // Check localStorage for token
  const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  console.log('🔑 Token from localStorage:', localStorageToken);
  
  // Use token from Redux or localStorage
  const tokenToUse = accessToken || localStorageToken;
  console.log('🔑 Token to use:', tokenToUse);
  
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoverKey, setHoverKey] = useState(null);
  const [form] = Form.useForm();
  const [editWordState, setEditWordState] = useState({ open: false, module: null, sectionNumber: null, wordIndex: null, values: { word: '', meaning: '', example: '', usage_tip: '' } });
  const [addWordState, setAddWordState] = useState({ open: false, module: null, sectionNumber: null, values: { word: '', meaning: '', example: '', usage_tip: '' } });
  const [quizViewOpen, setQuizViewOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [expandedModuleIds, setExpandedModuleIds] = useState(new Set());

  const isExpanded = (id) => expandedModuleIds.has(id);
  const toggleExpanded = (id) => {
    setExpandedModuleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Fetch course modules with words data
  const fetchModules = async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      console.log('🔍 Fetching modules for course:', courseId);
      console.log('🔑 Access token:', tokenToUse ? 'Present' : 'Missing');
      console.log('🔑 Token value:', tokenToUse);
      console.log('🔑 Token type:', typeof tokenToUse);
      
      // Pass raw token to GET helper (it builds headers internally)
      const response = await Get(
        BaseURL(`courses/${courseId}/modules`),
        tokenToUse
      );
      
      console.log('📊 API Response:', response);
      
      if (response?.data?.success) {
        const modulesData = response.data.data?.modules || response.data.data || [];
        console.log('✅ Modules fetched:', modulesData);
        
        // Process modules to extract words data
        const processedModules = modulesData.map(module => {
          const sections = module.contentSections || [];
          const allWords = sections.flatMap(sec => (sec.text || []).map((w, idx) => ({
            ...w,
            sectionNumber: sec.sectionNumber,
            wordIndex: idx,
          })));
          return {
            ...module,
            sections,
            allWords,
            wordsCount: allWords.length,
          };
        });
        
        setModules(processedModules);
        console.log('📚 Processed modules with words:', processedModules);
      } else {
        console.log('❌ API Error:', response?.data?.message);
        message.error(response?.data?.message || 'Failed to fetch modules');
      }
    } catch (error) {
      console.error('❌ Error fetching modules:', error);
      console.error('❌ Error details:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      
      // Silently handle 401/other errors for a clean view page
      if (error?.response?.status === 401) {
        // token invalid/expired – don't interrupt UI
        console.warn('401 Unauthorized while fetching modules');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  // Helpers to update module contentSections in-place
  const putModuleSections = async (mod, newSections) => {
    try {
      const resp = await Put(
        BaseURL(`modules/${mod._id}`),
        {
          courseId: mod.courseId || courseId,
          title: mod.title,
          description: mod.description,
          content: mod.content,
          contentSections: newSections,
        },
        apiHeader(tokenToUse)
      );
      if (resp?.data?.success) {
        // update local state without refetch
        setModules(prev => prev.map(m => m._id === mod._id ? {
          ...m,
          sections: newSections,
          allWords: (newSections || []).flatMap(sec => (sec.text || []).map((w, idx) => ({ ...w, sectionNumber: sec.sectionNumber, wordIndex: idx }))),
          wordsCount: (newSections || []).reduce((t, s) => t + ((s.text || []).length), 0),
        } : m));
        return true;
      }
      message.error(resp?.data?.message || 'Failed to update');
      return false;
    } catch (e) {
      console.error('❌ PUT module error:', e);
      message.error(e?.response?.data?.message || 'Update failed');
      return false;
    }
  };

  // Word actions
  const onClickEditWord = (mod, word) => {
    setEditWordState({
      open: true,
      module: mod,
      sectionNumber: word.sectionNumber,
      wordIndex: word.wordIndex,
      values: { word: word.word || '', meaning: word.meaning || '', example: word.example || '', usage_tip: word.usage_tip || '' }
    });
  };

  const onSubmitEditWord = async (vals) => {
    const { module: mod, sectionNumber, wordIndex } = editWordState;
    const newSections = (mod.sections || []).map(sec => {
      if (sec.sectionNumber !== sectionNumber) return sec;
      const newText = [...(sec.text || [])];
      newText[wordIndex] = { ...newText[wordIndex], ...vals };
      return { ...sec, text: newText };
    });
    const ok = await putModuleSections(mod, newSections);
    if (ok) setEditWordState({ open: false, module: null, sectionNumber: null, wordIndex: null, values: { word: '', meaning: '', example: '', usage_tip: '' } });
  };

  const onClickDeleteWord = async (mod, word) => {
    Modal.confirm({
      title: 'Delete this word?',
      content: `Are you sure you want to delete "${word.word || 'this word'}" from Section ${word.sectionNumber}?`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        const newSections = (mod.sections || []).map(sec => {
          if (sec.sectionNumber !== word.sectionNumber) return sec;
          const newText = (sec.text || []).filter((_, idx) => idx !== word.wordIndex);
          return { ...sec, text: newText };
        });
        await putModuleSections(mod, newSections);
      },
    });
  };

  const onClickAddWord = (mod) => {
    const defaultSection = (mod.sections?.[0]?.sectionNumber) || 1;
    setAddWordState({ open: true, module: mod, sectionNumber: defaultSection, values: { word: '', meaning: '', example: '', usage_tip: '' } });
  };

  const onSubmitAddWord = async (vals) => {
    const { module: mod, sectionNumber } = addWordState;
    const newSections = (mod.sections || []).map(sec => {
      if (sec.sectionNumber !== Number(sectionNumber)) return sec;
      const newText = [...(sec.text || []), vals];
      return { ...sec, text: newText };
    });
    const ok = await putModuleSections(mod, newSections);
    if (ok) setAddWordState({ open: false, module: null, sectionNumber: null, values: { word: '', meaning: '', example: '', usage_tip: '' } });
  };

  const openWordsView = (module) => {
    if (!module.allWords || module.allWords.length === 0) {
      message.warning('No words data available for this module');
      return;
    }
    
    console.log('📚 Opening words view for module:', module.title);
    console.log('📝 Words data:', module.allWords);
    
    // Store words data in sessionStorage and open vocabulary view
    sessionStorage.setItem('vocabularyData', JSON.stringify({
      module: module,
      sections: module.sections,
      words: module.allWords,
      moduleTitle: module.title,
      moduleNumber: module.moduleNumber
    }));
    
    const url = `/admin/vocabulary-view`;
    window.open(url, '_blank');
  };

  const fetchQuizById = async (quizId) => {
    if (!quizId) {
      message.warning('Quiz not available for this module');
      return;
    }
    setQuizLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(tokenToUse ? { Authorization: `Bearer ${tokenToUse}` } : {})
      };
      let resp = await fetch(BaseURL(`quizzes/${quizId}`), { method: 'GET', headers });
      if (!resp.ok) {
        resp = await fetch(BaseURL(`courses/quizzes/${quizId}`), { method: 'GET', headers });
      }
      if (!resp.ok) throw new Error('Failed to fetch quiz');
      const data = await resp.json();
      const quiz = data?.data?.quiz || data?.quiz || data;
      setSelectedQuiz(quiz);
      setQuizViewOpen(true);
    } catch (e) {
      message.error(e?.message || 'Unable to load quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const columns = [
    {
      title: 'Module #',
      dataIndex: 'moduleNumber',
      width: 100,
      render: (num) => <Tag color="blue">Module {num}</Tag>
    },
    {
      title: 'Title',
      dataIndex: 'title',
      ellipsis: true,
      width: 200
    },
    {
      title: 'Words Count',
      dataIndex: 'wordsCount',
      width: 120,
      render: (count) => (
        <Tag color="green">{count} words</Tag>
      )
    },
    {
      title: 'Words List',
      dataIndex: 'allWords',
      width: 300,
      render: (words) => (
        <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
          {words?.slice(0, 10).map((word, index) => (
            <Tag key={index} color="cyan" style={{ margin: '2px' }}>
              {word.word}
            </Tag>
          ))}
          {words?.length > 10 && (
            <Tag color="orange">+{words.length - 10} more</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Sections',
      dataIndex: 'sections',
      width: 100,
      render: (sections) => (
        <Tag color="purple">{sections?.length || 0} sections</Tag>
      )
    },
    {
      title: 'Actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            type="primary"
            icon={<EyeOutlined />} 
            onClick={() => openWordsView(record)}
            disabled={!record.allWords || record.allWords.length === 0}
          >
            View All Words
          </Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <div className={classes.page}>
        {/* Header */}
        <div className={classes.headerCard}>
          <h2>Course Modules & Vocabulary Words</h2>
          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Total Modules: <strong>{modules.length}</strong> | 
              Total Words: <strong>{modules.reduce((total, module) => total + (module.wordsCount || 0), 0)}</strong>
            </div>
          </div>
        </div>

        {/* Read-only Level-wise Words View (merge all sections per level) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {modules.map((m) => (
            <Card key={m._id} title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span onClick={() => toggleExpanded(m._id)} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                  {isExpanded(m._id) ? <DownOutlined /> : <RightOutlined />}
                </span>
                <Tag color="blue" style={{ marginLeft: 6 }}>Module {m.moduleNumber}</Tag>
                <span style={{ fontWeight: 600 }}>{m.title}</span>
                <Tag color="green">{m.wordsCount} words</Tag>
                <Tag color="purple">{m.sections?.length || 0} sections</Tag>
              </div>
            }>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, gap: 8 }}>
                <Button 
                  size="middle"
                  className={classes.viewQuizBtn}
                  onClick={() => { if (m.quiz_id) { window.open(`/admin/quiz-view/${m.quiz_id}`, '_blank'); } }}
                  disabled={!m.quiz_id}
                >
                  View Quiz
                </Button>
                <Button 
                  size="middle" 
                  type="primary" 
                  onClick={() => onClickAddWord(m)}
                  icon={<EyeOutlined style={{ display: 'none' }} />}
                  style={{
                    background: '#1e3a8a',
                    borderColor: '#1e3a8a',
                    fontWeight: 600,
                    boxShadow: '0 6px 16px rgba(30,58,138,0.25)'
                  }}
                >
                  + Add Word
                </Button>
              </div>
              {isExpanded(m._id) && (
                (!m.allWords || m.allWords.length === 0) ? (
                  <div style={{ color: '#888' }}>No words found.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                    {m.allWords.map((w, idx) => {
                      const key = `${m._id}-${w.sectionNumber}-${w.wordIndex}`;
                      const isHover = hoverKey === key;
                      return (
                        <div key={key}
                          style={{ position: 'relative' }}
                          onMouseEnter={() => setHoverKey(key)}
                          onMouseLeave={() => setHoverKey(null)}
                        >
                          <Card 
                            size="small" 
                            style={{ 
                              width: '100%',
                              border: '1px solid #e5e7eb',
                              background: '#f9fafb',
                              boxShadow: isHover ? '0 8px 20px rgba(0,0,0,0.12)' : '0 2px 6px rgba(0,0,0,0.06)',
                              transition: 'box-shadow 0.15s ease'
                            }}
                          >
                            <div style={{ fontWeight: 800, color: '#111827' }}>{w.word}</div>
                            {w.meaning && <div style={{ color: '#374151', marginTop: 6, lineHeight: 1.4 }}>{w.meaning}</div>}
                            {w.example && <div style={{ color: '#6b7280', marginTop: 8, fontStyle: 'italic' }}>
                              “{w.example}”
                            </div>}
                            {w.usage_tip && <div style={{ color: '#6b7280', marginTop: 8, fontSize: 12 }}>
                              Tip: {w.usage_tip}
                            </div>}
                          </Card>
                          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6, opacity: isHover ? 1 : 0, transition: 'opacity 0.15s' }}>
                            <Tooltip title="Edit">
                              <Button 
                                size="small" 
                                shape="circle" 
                                icon={<EditOutlined />} 
                                onClick={() => onClickEditWord(m, w)}
                              />
                            </Tooltip>
                            <Tooltip title="Delete">
                              <Button 
                                size="small" 
                                shape="circle" 
                                danger 
                                icon={<DeleteOutlined />} 
                                onClick={() => onClickDeleteWord(m, w)}
                              />
                            </Tooltip>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </Card>
          ))}
        </div>

        {/* Edit Word Modal */}
        <Modal
          title="Edit Word"
          open={editWordState.open}
          onCancel={() => setEditWordState({ open: false, module: null, sectionNumber: null, wordIndex: null, values: { word: '', meaning: '', example: '', usage_tip: '' } })}
          footer={null}
          destroyOnClose
          width={720}
          bodyStyle={{ paddingTop: 12, paddingBottom: 12 }}
          centered
        >
          <Form
            layout="vertical"
            initialValues={editWordState.values}
            onFinish={onSubmitEditWord}
            key={`${editWordState.sectionNumber}-${editWordState.wordIndex}`}
          >
            <Row gutter={[16, 12]}>
              <Col xs={24} md={12}>
                <Form.Item label="Word" name="word" rules={[{ required: true, message: 'Please enter the word' }]}>
                  <Input placeholder="e.g. curriculum" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Usage Tip" name="usage_tip">
                  <Input placeholder="e.g. Use for overall study content" allowClear />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Meaning" name="meaning">
                  <Input.TextArea
                    placeholder="Short meaning/definition"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    showCount
                    maxLength={300}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Example" name="example">
                  <Input.TextArea
                    placeholder="An example sentence"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    showCount
                    maxLength={300}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <Button onClick={() => setEditWordState({ open: false, module: null, sectionNumber: null, wordIndex: null, values: { word: '', meaning: '', example: '', usage_tip: '' } })}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save</Button>
            </div>
          </Form>
        </Modal>

        {/* Add Word Modal */}
        <Modal
          title="Add Word"
          open={addWordState.open}
          onCancel={() => setAddWordState({ open: false, module: null, sectionNumber: null, values: { word: '', meaning: '', example: '', usage_tip: '' } })}
          footer={null}
          destroyOnClose
        >
          <Form layout="vertical" onFinish={onSubmitAddWord} initialValues={addWordState.values}
            key={`${addWordState.module?._id || 'x'}-${addWordState.sectionNumber || 's'}`}
          >
            <Form.Item label="Section" required>
              <Select
                value={addWordState.sectionNumber}
                onChange={(val) => setAddWordState(s => ({ ...s, sectionNumber: val }))}
                options={(addWordState.module?.sections || []).map(sec => ({ label: `Section ${sec.sectionNumber}`, value: sec.sectionNumber }))}
              />
            </Form.Item>
            <Form.Item label="Word" name="word" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Meaning" name="meaning">
              <Input />
            </Form.Item>
            <Form.Item label="Example" name="example">
              <Input />
            </Form.Item>
            <Form.Item label="Usage Tip" name="usage_tip">
              <Input />
            </Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setAddWordState({ open: false, module: null, sectionNumber: null, values: { word: '', meaning: '', example: '', usage_tip: '' } })}>Cancel</Button>
              <Button type="primary" htmlType="submit">Add</Button>
            </div>
          </Form>
        </Modal>

        {/* Quiz View Modal */}
        <Modal
          open={quizViewOpen}
          onCancel={() => { setQuizViewOpen(false); setSelectedQuiz(null); }}
          title={null}
          footer={null}
          centered
          width={800}
          bodyStyle={{ padding: 0, borderRadius: 12, overflow: 'hidden' }}
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
