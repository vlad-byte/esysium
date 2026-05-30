import React from "react";
import TabButton from "./TabButton";
import NotionMarkdown from "./NotionMarkdown";
import StructuredFeedbackView from "./StructuredFeedbackView";

interface FeedbackBlockProps {
  tab: 'feedback' | 'sample' | 'resources';
  setTab: (tab: 'feedback' | 'sample' | 'resources') => void;
  userAnswered: boolean;
  sentAnswer: string | null;
  feedback: string;
  sampleAnswer: string;
  resourse?: string | null;
  onRepeatAnswer?: () => void;
}

const ResourceLink: React.FC<{ url: string }> = ({ url }) => {
  const trimmed = url.trim();
  if (!trimmed) return null;
  let hostname = trimmed;
  try { hostname = new URL(trimmed).hostname.replace(/^www\./, ''); } catch {}
  return (
    <a
      href={trimmed}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-sm font-medium transition group"
    >
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="shrink-0 text-blue-400 group-hover:text-blue-600">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="truncate">{hostname}</span>
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" className="shrink-0 ml-auto text-blue-300 group-hover:text-blue-500">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </a>
  );
};

const FeedbackBlock: React.FC<FeedbackBlockProps> = ({ tab, setTab, userAnswered, sentAnswer, feedback, sampleAnswer, resourse }) => {
  const links = resourse
    ? resourse.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="w-full bg-white rounded-xl shadow border border-gray-100 p-4 flex flex-col gap-4">
      <div className="flex gap-2 mb-2 flex-wrap">
        <TabButton isActive={tab === 'feedback'} onClick={() => setTab('feedback')}>
          Feedback
        </TabButton>
        <TabButton isActive={tab === 'sample'} onClick={() => setTab('sample')}>
          Sample Answer
        </TabButton>
        {links.length > 0 && (
          <TabButton isActive={tab === 'resources'} onClick={() => setTab('resources')}>
            Ресурсы
          </TabButton>
        )}
      </div>
      <div className="min-h-[60px] text-base text-gray-700 flex flex-col gap-2">
        {tab === 'feedback' ? (
          userAnswered && sentAnswer ? (
            <>
              <div className="text-xs text-gray-400 mb-1">Ваш ответ:</div>
              <div className="bg-blue-50 rounded p-2 text-gray-900 mb-2">{sentAnswer}</div>
              <StructuredFeedbackView feedback={feedback} />
            </>
          ) : (
            <div className="bg-blue-50 rounded p-2 text-center text-gray-500">Обратная связь появится после ответа на вопрос</div>
          )
        ) : tab === 'sample' ? (
          <div className="bg-gray-50 rounded p-2 text-gray-900">
            <NotionMarkdown content={sampleAnswer} />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {links.length === 0 ? (
              <div className="text-gray-400 text-sm text-center py-4">Нет ресурсов для этого вопроса</div>
            ) : (
              links.map((link, i) => <ResourceLink key={i} url={link} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackBlock;
