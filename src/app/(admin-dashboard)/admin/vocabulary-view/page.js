'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Space, Modal, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import classes from './vocabulary-view.module.css';

export default function VocabularyView() {
  const router = useRouter();
  const [vocabularyData, setVocabularyData] = useState(null);
  const [editingWord, setEditingWord] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    // Get data from sessionStorage
    const storedData = sessionStorage.getItem('vocabularyData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setVocabularyData(parsedData);
        // DON'T clear the stored data - keep it for updates
      } catch (error) {
        console.error('Error parsing vocabulary data:', error);
        message.error('Error loading vocabulary data');
      }
    } else {
      message.error('No vocabulary data found. Please go back and try again.');
    }
  }, []);

  const handleEditWord = (levelIndex, sessionIndex, wordIndex, word) => {
    setEditingWord({ levelIndex, sessionIndex, wordIndex });
    setEditForm({
      word: word.word,
      meaning: word.meaning,
      example: word.example,
      usage_tip: word.usage_tip
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingWord) return;

    const { levelIndex, sessionIndex, wordIndex } = editingWord;
    
    setVocabularyData(prev => {
      const newData = { ...prev };
      newData.data.levels[levelIndex].sessions[sessionIndex].vocabularies[wordIndex] = {
        ...newData.data.levels[levelIndex].sessions[sessionIndex].vocabularies[wordIndex],
        ...editForm
      };
      
      // Update sessionStorage with new data
      sessionStorage.setItem('vocabularyData', JSON.stringify(newData));
      
      return newData;
    });

    setEditModalOpen(false);
    setEditingWord(null);
    setEditForm({});
    message.success('Word updated successfully!');
  };

  const handleDeleteWord = (levelIndex, sessionIndex, wordIndex) => {
    setVocabularyData(prev => {
      const newData = { ...prev };
      newData.data.levels[levelIndex].sessions[sessionIndex].vocabularies.splice(wordIndex, 1);
      
      // Update sessionStorage with new data
      sessionStorage.setItem('vocabularyData', JSON.stringify(newData));
      
      return newData;
    });
    message.success('Word deleted successfully!');
  };

  const handleAddWord = (levelIndex, sessionIndex) => {
    const newWord = {
      word: 'New Word',
      meaning: 'Enter meaning',
      example: 'Enter example',
      usage_tip: 'Enter usage tip'
    };

    setVocabularyData(prev => {
      const newData = { ...prev };
      newData.data.levels[levelIndex].sessions[sessionIndex].vocabularies.push(newWord);
      
      // Update sessionStorage with new data
      sessionStorage.setItem('vocabularyData', JSON.stringify(newData));
      
      return newData;
    });

    // Edit the newly added word
    const wordIndex = vocabularyData.data.levels[levelIndex].sessions[sessionIndex].vocabularies.length;
    handleEditWord(levelIndex, sessionIndex, wordIndex, newWord);
  };

  if (!vocabularyData) {
    return (
      <div className={classes.loading}>
        <h2>Loading vocabulary data...</h2>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.back()}
          className={classes.backBtn}
        >
          Back to AI Session Approval
        </Button>
        <h1>Vocabulary Words - {vocabularyData.data.english_level} Level</h1>
        <p>Area of Interest: {vocabularyData.data.area_of_interest}</p>
      </div>

      <div className={classes.levelsContainer}>
        {vocabularyData.data.levels.map((level, levelIndex) => (
          <Card key={levelIndex} className={classes.levelCard}>
            <div className={classes.levelHeader}>
              <h2>Level {level.level_number}</h2>
              <span className={classes.wordCount}>
                {level.sessions.reduce((total, session) => total + session.vocabularies.length, 0)} words
              </span>
            </div>

            {/* Combine all sessions into one level view */}
            <div className={classes.wordsGrid}>
              {level.sessions.flatMap((session, sessionIndex) => 
                session.vocabularies.map((word, wordIndex) => (
                  <Card key={`${sessionIndex}-${wordIndex}`} className={classes.wordCard}>
                    <div className={classes.wordContent}>
                      <h4>{word.word}</h4>
                      <p><strong>Meaning:</strong> {word.meaning}</p>
                      <p><strong>Example:</strong> {word.example}</p>
                      <p><strong>Tip:</strong> {word.usage_tip}</p>
                    </div>
                    
                    <div className={classes.wordActions}>
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditWord(levelIndex, sessionIndex, wordIndex, word)}
                      >
                        Edit
                      </Button>
                      <Popconfirm
                        title="Are you sure you want to delete this word?"
                        onConfirm={() => handleDeleteWord(levelIndex, sessionIndex, wordIndex)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                        >
                          Delete
                        </Button>
                      </Popconfirm>
                    </div>
                  </Card>
                ))
              )}
              
              <Card className={classes.addWordCard}>
                <Button
                  type="dashed"
                  onClick={() => handleAddWord(levelIndex, 0)} // Add to first session
                  className={classes.addWordBtn}
                >
                  + Add New Word
                </Button>
              </Card>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        title="Edit Word"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" icon={<SaveOutlined />} onClick={handleSaveEdit}>
            Save Changes
          </Button>
        ]}
        width={600}
      >
        <div className={classes.editForm}>
          <div className={classes.formGroup}>
            <label>Word:</label>
            <Input
              value={editForm.word}
              onChange={(e) => setEditForm(prev => ({ ...prev, word: e.target.value }))}
              placeholder="Enter word"
            />
          </div>
          
          <div className={classes.formGroup}>
            <label>Meaning:</label>
            <Input.TextArea
              value={editForm.meaning}
              onChange={(e) => setEditForm(prev => ({ ...prev, meaning: e.target.value }))}
              placeholder="Enter meaning"
              rows={3}
            />
          </div>
          
          <div className={classes.formGroup}>
            <label>Example:</label>
            <Input.TextArea
              value={editForm.example}
              onChange={(e) => setEditForm(prev => ({ ...prev, example: e.target.value }))}
              placeholder="Enter example"
              rows={2}
            />
          </div>
          
          <div className={classes.formGroup}>
            <label>Usage Tip:</label>
            <Input.TextArea
              value={editForm.usage_tip}
              onChange={(e) => setEditForm(prev => ({ ...prev, usage_tip: e.target.value }))}
              placeholder="Enter usage tip"
              rows={2}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
