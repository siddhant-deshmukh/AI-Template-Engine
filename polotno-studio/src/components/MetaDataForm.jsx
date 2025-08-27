import React, { useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const TagEditor = (props) => {
  const { selectedElement, setMetaData } = props;

  const [tags, setTags] = useState([]);

  useEffect(() => {
    if(!selectedElement) {
      setTags([]);
    }
    const selectedData = selectedElement.toJSON();
    return (selectedData && selectedData.custom && selectedData.custom.metaData) ? setTags([selectedData.custom.metaData]) : setTags([]);
  }, [selectedElement])

  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const handleInputChange = (e) => {
    if (!e.target.value || e.target.value.length == 0)
      setEditingIndex(null);
    setInputValue(e.target.value);
  };

  const handleAddTag = () => {
    if (inputValue && inputValue.trim() !== '') {
      setTags([...tags, inputValue.trim()]);
      setMetaData([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleEditTag = () => {
    if (editingIndex !== null && inputValue && inputValue.trim() !== '') {
      const newTags = [...tags];
      newTags[editingIndex] = inputValue.trim();
      setTags(newTags);
      setMetaData(newTags);
      setInputValue('');
      setEditingIndex(null);
    }
  };

  const handleRemoveTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    setMetaData(newTags);
    if (editingIndex === index) {
      setInputValue('');
      setEditingIndex(null);
    }
  };

  const handleSelectTag = (tag, index) => {
    setInputValue(tag);
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setInputValue('');
    setEditingIndex(null);
  };

  return (
    <div className=''>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
          <Badge key={index} className="flex items-center border-0 text-sm hover:cursor-pointer hover:bg-black/80 pr-0 py-0 overflow-hidden" onClick={() => handleSelectTag(tag, index)}>
            <span className='pl-2.5 pr-1'>{tag}</span>
            <button className=" p-1.5 hover:bg-red-600 transition-colors duration-200" onClick={(e) => {
              e.stopPropagation(); // Prevent the parent div's onClick
              handleRemoveTag(index);
            }}>
              <X className='h-3 w-3' />
            </button>
          </Badge>
        ))}
      </div>

      <div className="w-full flex flex-col items-center">
        <Input
          type="text"
          placeholder={editingIndex !== null ? "Edit tag..." : "Add new tag..."}
          value={inputValue}
          className="mb-2"
          onChange={handleInputChange}
        />
        <div className='ml-auto flex space-x-2'>
          {editingIndex !== null ? (
            <Button onClick={handleEditTag} disabled={!inputValue}>Edit</Button>
          ) : (
            <Button onClick={handleAddTag} disabled={!inputValue}>Add</Button>
          )}
          <Button onClick={handleCancelEdit} variant="outline">Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default TagEditor;