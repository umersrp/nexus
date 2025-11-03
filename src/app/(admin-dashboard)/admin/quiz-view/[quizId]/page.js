'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Button, Card, Modal, Form, Input, Tag, Space, message, Spin, Row, Col, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { BaseURL } from '@/config/apiUrl';
import classes from '../quiz-view.module.css';

const { TextArea } = Input;

export default function QuizViewPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId;
  const accessToken = useSelector((state) => state.authReducer.accessToken);

  const [quiz, setQuiz] = useState(null);
  const [fullQuiz, setFullQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [hoverKey, setHoverKey] = useState(null);
  const [editState, setEditState] = useState({ open: false, qIndex: null, values: {} });
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
  });

  // === FETCH QUIZ ===
  const fetchQuiz = async () => {
    if (!quizId) return;
    setLoading(true);
    try {
      let resp = await fetch(BaseURL(`quizzes/${quizId}`), { headers: getHeaders() });
      if (!resp.ok) resp = await fetch(BaseURL(`courses/quizzes/${quizId}`), { headers: getHeaders() });
      if (!resp.ok) throw new Error('Failed to fetch quiz');
      const data = await resp.json();
      const q = data?.data?.quiz || data?.quiz || data;

      setFullQuiz(q);

      const levelMatch = q.title?.match(/(A1\/A2|B1|B2|C1|C2)/);
      const level = levelMatch ? levelMatch[1] : 'A1/A2';

      const levelQuestions = (q.questions || [])
        .filter(qq => !qq.level || qq.level === level)
        .map((qq, i) => ({ ...qq, qIndex: i, key: `q-${i}` }));

      const displayQuiz = { ...q, currentLevel: level, questions: levelQuestions };
      setQuiz(displayQuiz);
      setCurrentLevel(level);
      sessionStorage.setItem(`quiz_${quizId}`, JSON.stringify(displayQuiz));
    } catch (e) {
      message.error(e.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  // === UPDATE SERVER - FIXED ===
  const updateQuizOnServer = async (updatedLevelQuestions) => {
    if (!fullQuiz) return false;
    setSaving(true);

    try {
      // Create a map of updated questions by _id for easy lookup
      const updatedQuestionsMap = {};
      updatedLevelQuestions.forEach(q => {
        updatedQuestionsMap[q._id] = q;
      });

      // Merge questions - preserve order and include all questions
      const mergedQuestions = fullQuiz.questions.map(originalQ => {
        // If this question exists in updated questions, merge it
        if (updatedQuestionsMap[originalQ._id]) {
          return { 
            ...originalQ, 
            ...updatedQuestionsMap[originalQ._id],
            questionNumber: originalQ.questionNumber
          };
        }
        return originalQ;
      });

      // Add new questions (those without proper _id)
      const newQuestions = updatedLevelQuestions.filter(uq => 
        !uq._id || !uq._id.toString().match(/^[0-9a-fA-F]{24}$/)
      );
      
      newQuestions.forEach((newQ, index) => {
        mergedQuestions.push({
          ...newQ,
          questionNumber: mergedQuestions.length + 1
        });
      });

      // Prepare payload exactly as backend expects
      const payload = {
        title: fullQuiz.title,
        description: fullQuiz.description,
        totalMarks: mergedQuestions.reduce((sum, q) => sum + (q.points || 1), 0),
        passingMarks: fullQuiz.passingMarks,
        timeLimit: fullQuiz.timeLimit,
        quizType: fullQuiz.quizType,
        courseId: fullQuiz.courseId,
        moduleId: fullQuiz.moduleId,
        questions: mergedQuestions.map((q, index) => ({
          _id: q._id || undefined,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          points: q.points || 1,
          questionNumber: index + 1
        }))
      };

      console.log('🚀 FINAL PUT PAYLOAD:', JSON.stringify(payload, null, 2));

      const resp = await fetch(BaseURL(`quizzes/${quizId}`), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      const result = await resp.json();
      console.log('✅ PUT RESPONSE:', result);

      if (!resp.ok) throw new Error(result.message || 'Update failed');

      const updatedFullQuiz = result.data?.quiz || result.quiz || result;
      setFullQuiz(updatedFullQuiz);

      // UI REFRESH FROM updatedFullQuiz
      const levelFiltered = {
        ...updatedFullQuiz,
        currentLevel: currentLevel,
        questions: updatedFullQuiz.questions
          .filter(q => !q.level || q.level === currentLevel)
          .map((q, i) => ({ ...q, qIndex: i, key: `q-${i}` }))
      };
      setQuiz(levelFiltered);
      sessionStorage.setItem(`quiz_${quizId}`, JSON.stringify(levelFiltered));

      message.success('Quiz updated successfully!');
      return true;
    } catch (e) {
      console.error('❌ Update error:', e);
      message.error(e.message || 'Update failed');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // === DELETE FUNCTION - COMPLETELY FIXED ===
  const onDelete = async (qIndex) => {
    const questionToDelete = quiz.questions[qIndex];
    
    Modal.confirm({
      title: 'Delete Question?',
      content: `Are you sure you want to delete question ${questionToDelete.questionNumber}? This action cannot be undone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setSaving(true);
          
          // Create updated questions array without the deleted question
          const updatedQuestions = quiz.questions.filter((_, i) => i !== qIndex);
          
          // Re-number the questions
          const renumberedQuestions = updatedQuestions.map((q, index) => ({
            ...q,
            questionNumber: index + 1
          }));
          
          console.log('🗑️ Deleting question:', questionToDelete);
          console.log('📝 Updated questions:', renumberedQuestions);
          
          // Update UI immediately with renumbered questions
          setQuiz(prev => ({ 
            ...prev, 
            questions: renumberedQuestions.map((q, i) => ({ ...q, qIndex: i, key: `q-${i}` }))
          }));
          
          // Update server with the complete quiz data
          const success = await updateQuizOnServer(renumberedQuestions);
          
          if (success) {
            message.success('Question deleted successfully!');
          } else {
            // If server update fails, revert UI
            fetchQuiz(); // Reload original data
            message.error('Failed to delete question');
          }
        } catch (error) {
          console.error('❌ Delete error:', error);
          // Revert on error
          fetchQuiz();
          message.error('Error deleting question');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  // === EDIT FUNCTION ===
  const onEdit = (qIndex, question) => {
    console.log('Editing question:', question);
    setEditState({
      open: true,
      qIndex,
      values: {
        question: question.question,
        options: { ...question.options },
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || '',
        points: question.points || 1
      }
    });
  };

  const onSaveEdit = async (values) => {
    if (editState.qIndex === null) return;
    
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[editState.qIndex] = { 
      ...updatedQuestions[editState.qIndex], 
      ...values 
    };

    // Update UI immediately
    setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    
    // Update server
    const success = await updateQuizOnServer(updatedQuestions);
    if (success) {
      setEditState({ open: false, qIndex: null, values: {} });
    }
  };

  // === ADD FUNCTION ===
  const onSaveAdd = async (values) => {
    const newQ = {
      _id: `temp-${Date.now()}`,
      question: values.question,
      options: values.options,
      correctAnswer: values.correctAnswer,
      explanation: values.explanation || '',
      points: values.points || 1,
      questionNumber: quiz.questions.length + 1
    };

    const updatedQuestions = [...quiz.questions, newQ];
    
    // Update UI immediately
    setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    
    // Update server
    const success = await updateQuizOnServer(updatedQuestions);
    if (success) {
      setAddOpen(false);
    }
  };

  // === REFRESH FUNCTION ===
  const handleRefresh = () => {
    fetchQuiz();
    message.info('Refreshing quiz data...');
  };

  // === RENDER ===
  if (loading) return <div className={classes.loading}><Spin size="large" /><h2>Loading...</h2></div>;
  if (!quiz || !fullQuiz) return <Card>Quiz not found.</Card>;

  return (
    <div className={classes.page}>
      {/* Header */}
      <div className={classes.headerCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()} 
            className={classes.backBtn}
            disabled={saving}
          >
            Back
          </Button>
          
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2>Quiz - {currentLevel} Level {saving && <Spin size="small" style={{ marginLeft: 10 }} />}</h2>
            <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Tag color="blue">{quiz.title}</Tag>
              <Tag color="green">{quiz.questions.length} questions</Tag>
              <Tag color="purple">Pass: {quiz.passingMarks}</Tag>
              {saving && <Tag color="orange">Saving...</Tag>}
            </div>
          </div>

          <Button 
            onClick={handleRefresh}
            disabled={saving}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Questions */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Tag color="blue">Level {currentLevel}</Tag>
              <span style={{ fontWeight: 600, marginLeft: 8 }}>{quiz.questions.length} questions</span>
            </div>
            <Button
              type="primary"
              onClick={() => setAddOpen(true)}
              style={{ background: '#1e3a8a', borderColor: '#1e3a8a', fontWeight: 600 }}
              disabled={saving}
            >
              <PlusOutlined /> Add Question
            </Button>
          </div>
        }
      >
        {quiz.questions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#888' }}>
            No questions found. 
            <br />
            <Button type="link" onClick={() => setAddOpen(true)}>Add your first question</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {quiz.questions.map((q, i) => {
              const key = q.key || `q-${i}`;
              const isHover = hoverKey === key;
              return (
                <div
                  key={key}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setHoverKey(key)}
                  onMouseLeave={() => setHoverKey(null)}
                >
                  <Card
                    size="small"
                    style={{
                      border: '1px solid #e5e7eb',
                      background: '#f9fafb',
                      boxShadow: isHover ? '0 8px 20px rgba(0,0,0,0.12)' : '0 2px 6px rgba(0,0,0,0.06)',
                      transition: 'all 0.2s',
                      minHeight: '140px'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: 15, marginBottom: 8 }}>
                      Q{q.questionNumber}. {q.question}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {Object.entries(q.options || {}).map(([k, v]) => (
                        <div 
                          key={k} 
                          style={{ 
                            fontSize: 13, 
                            color: k === q.correctAnswer ? '#065f46' : '#374151',
                            fontWeight: k === q.correctAnswer ? 'bold' : 'normal',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            background: k === q.correctAnswer ? '#f0fdf4' : 'transparent'
                          }}
                        >
                          <strong>{k}.</strong> {v}
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, color: '#065f46', fontWeight: 600, fontSize: 12 }}>
                      ✅ Correct: {q.correctAnswer}
                    </div>
                    {q.points && (
                      <div style={{ marginTop: 4, fontSize: 12, color: '#7c3aed' }}>
                        📊 Points: {q.points}
                      </div>
                    )}
                    {q.explanation && (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#6b7280', fontStyle: 'italic', borderTop: '1px solid #e5e7eb', paddingTop: 4 }}>
                        💡 {q.explanation}
                      </div>
                    )}
                  </Card>

                  {/* EDIT & DELETE BUTTONS */}
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    display: 'flex', gap: 6,
                    opacity: isHover ? 1 : 0,
                    transition: 'opacity 0.15s'
                  }}>
                    <Tooltip title="Edit">
                      <Button 
                        size="small" 
                        shape="circle" 
                        icon={<EditOutlined />} 
                        onClick={() => onEdit(i, q)}
                        disabled={saving}
                      />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <Button 
                        size="small" 
                        shape="circle" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => onDelete(i)}
                        disabled={saving}
                      />
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal 
        title="Edit Question" 
        open={editState.open} 
        onCancel={() => !saving && setEditState({ open: false, qIndex: null, values: {} })} 
        footer={null} 
        width={720} 
        centered
        maskClosable={!saving}
        closable={!saving}
      >
        <Form 
          layout="vertical" 
          initialValues={editState.values} 
          onFinish={onSaveEdit}
          disabled={saving}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Question" name="question" rules={[{ required: true, message: 'Question is required' }]}>
                <TextArea rows={2} placeholder="Enter question text" />
              </Form.Item>
            </Col>
            {['A', 'B', 'C', 'D'].map(l => (
              <Col span={12} key={l}>
                <Form.Item 
                  label={`Option ${l}`} 
                  name={['options', l]} 
                  rules={[{ required: true, message: `Option ${l} is required` }]}
                >
                  <Input placeholder={`Enter option ${l}`} />
                </Form.Item>
              </Col>
            ))}
            <Col span={12}>
              <Form.Item 
                label="Correct Answer" 
                name="correctAnswer" 
                rules={[{ required: true, message: 'Correct answer is required' }]}
              >
                <Input placeholder="A, B, C, or D" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Points" name="points" initialValue={1}>
                <Input type="number" min={1} placeholder="Points for this question" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Explanation" name="explanation">
                <TextArea rows={2} placeholder="Explanation for the correct answer" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={() => setEditState({ open: false, qIndex: null, values: {} })} disabled={saving}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }} loading={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Add Modal */}
      <Modal 
        title={`Add Question - ${currentLevel}`} 
        open={addOpen} 
        onCancel={() => !saving && setAddOpen(false)} 
        footer={null} 
        width={720} 
        centered
        maskClosable={!saving}
        closable={!saving}
      >
        <Form layout="vertical" onFinish={onSaveAdd} disabled={saving}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Question" name="question" rules={[{ required: true, message: 'Question is required' }]}>
                <TextArea rows={2} placeholder="Enter question text" />
              </Form.Item>
            </Col>
            {['A', 'B', 'C', 'D'].map(l => (
              <Col span={12} key={l}>
                <Form.Item 
                  label={`Option ${l}`} 
                  name={['options', l]} 
                  rules={[{ required: true, message: `Option ${l} is required` }]}
                >
                  <Input placeholder={`Enter option ${l}`} />
                </Form.Item>
              </Col>
            ))}
            <Col span={12}>
              <Form.Item 
                label="Correct Answer" 
                name="correctAnswer" 
                rules={[{ required: true, message: 'Correct answer is required' }]}
              >
                <Input placeholder="A, B, C, or D" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Points" name="points" initialValue={1}>
                <Input type="number" min={1} placeholder="Points for this question" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Explanation" name="explanation">
                <TextArea rows={2} placeholder="Explanation for the correct answer" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button onClick={() => setAddOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }} loading={saving}>
              {saving ? 'Adding...' : 'Add Question'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}