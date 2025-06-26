import { useState } from 'react';

export function useTagManagement() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState<string>('');
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
      setIsAddingTag(false);
    }
  };

  const handleStartAddingTag = () => {
    setIsAddingTag(true);
    setCustomTag('');
  };

  const handleCancelAddingTag = () => {
    setIsAddingTag(false);
    setCustomTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustomTag();
    } else if (e.key === 'Escape') {
      handleCancelAddingTag();
    }
  };

  const resetTags = () => {
    setSelectedTags([]);
    setCustomTag('');
    setIsAddingTag(false);
  };

  return {
    selectedTags,
    customTag,
    isAddingTag,
    setCustomTag,
    setSelectedTags,
    handleTagToggle,
    handleAddCustomTag,
    handleStartAddingTag,
    handleCancelAddingTag,
    handleRemoveTag,
    handleKeyPress,
    resetTags,
  };
}
