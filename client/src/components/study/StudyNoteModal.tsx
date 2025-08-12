import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  XMarkIcon,
  PaperClipIcon,
  EyeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { studyNotesApi, StudyNote } from '../../services/studyService';

interface StudyNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note?: StudyNote | null;
}

interface FormData {
  title: string;
  content: string;
  subject: string;
  category: string;
  difficulty: string;
  tags: string;
  isPublic: boolean;
}

const StudyNoteModal: React.FC<StudyNoteModalProps> = ({ isOpen, onClose, note }) => {
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const isEditing = !!note;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      content: '',
      subject: '',
      category: '其他',
      difficulty: '中等',
      tags: '',
      isPublic: false,
    },
  });

  const watchedContent = watch('content');

  useEffect(() => {
    if (note) {
      reset({
        title: note.title,
        content: note.content,
        subject: note.subject,
        category: note.category,
        difficulty: note.difficulty,
        tags: note.tags.join(', '),
        isPublic: note.isPublic,
      });
    } else {
      reset({
        title: '',
        content: '',
        subject: '',
        category: '其他',
        difficulty: '中等',
        tags: '',
        isPublic: false,
      });
    }
  }, [note, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('subject', data.subject);
      formData.append('category', data.category);
      formData.append('difficulty', data.difficulty);
      formData.append('tags', JSON.stringify(data.tags.split(',').map(tag => tag.trim()).filter(tag => tag)));
      formData.append('isPublic', data.isPublic.toString());
      
      // 添加附件
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
      
      if (isEditing) {
        await studyNotesApi.updateNote(note._id!, formData);
      } else {
        await studyNotesApi.createNote(formData);
      }
      
      onClose();
    } catch (error) {
      console.error('保存笔记失败:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdownPreview = (content: string) => {
    // 简单的Markdown渲染（实际项目中建议使用react-markdown）
    return content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/gim, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/gim, '<br>');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {isEditing ? '编辑笔记' : '新建笔记'}
                  </Dialog.Title>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>{previewMode ? '编辑' : '预览'}</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* 基本信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        标题 *
                      </label>
                      <input
                        {...register('title', { required: '请输入标题' })}
                        className="input-field"
                        placeholder="输入笔记标题"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        科目 *
                      </label>
                      <input
                        {...register('subject', { required: '请输入科目' })}
                        className="input-field"
                        placeholder="如：数学、英语、计算机"
                      />
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        分类
                      </label>
                      <select {...register('category')} className="input-field">
                        <option value="课堂笔记">课堂笔记</option>
                        <option value="复习总结">复习总结</option>
                        <option value="知识点整理">知识点整理</option>
                        <option value="错题集">错题集</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        难度
                      </label>
                      <select {...register('difficulty')} className="input-field">
                        <option value="简单">简单</option>
                        <option value="中等">中等</option>
                        <option value="困难">困难</option>
                      </select>
                    </div>
                  </div>

                  {/* 标签 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      标签
                    </label>
                    <input
                      {...register('tags')}
                      className="input-field"
                      placeholder="用逗号分隔多个标签，如：重点, 考试, 难点"
                    />
                  </div>

                  {/* 内容编辑区 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      内容 * {previewMode && '(预览模式)'}
                    </label>
                    {previewMode ? (
                      <div 
                        className="min-h-[300px] p-4 border border-gray-300 rounded-lg bg-gray-50"
                        dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(watchedContent || '') }}
                      />
                    ) : (
                      <textarea
                        {...register('content', { required: '请输入内容' })}
                        rows={12}
                        className="input-field resize-none"
                        placeholder="支持Markdown格式：\n# 一级标题\n## 二级标题\n**粗体** *斜体*\n`代码`"
                      />
                    )}
                    {errors.content && (
                      <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                    )}
                  </div>

                  {/* 附件上传 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      附件
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                        <PaperClipIcon className="h-5 w-5 text-gray-600" />
                        <span className="text-sm text-gray-700">选择文件</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {attachments.map((file, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                            >
                              <DocumentTextIcon className="h-3 w-3 mr-1" />
                              {file.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 公开设置 */}
                  <div className="flex items-center">
                    <input
                      {...register('isPublic')}
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      公开笔记（其他人可以查看）
                    </label>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? '保存中...' : (isEditing ? '更新' : '创建')}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default StudyNoteModal;