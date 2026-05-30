import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
import styles from "./NotionMarkdown.module.css";

const NotionMarkdown = ({ content }) => (
  <div className={styles.notionMarkdownRoot}>
    <ReactMarkdown
      children={content}
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeHighlight]}
      components={{
        h1: ({node, ...props}) => <h1 className={styles.h1} {...props} />,
        h2: ({node, ...props}) => <h2 className={styles.h2} {...props} />,
        pre: ({ node, ...props }) => <pre className={styles.codeBlock} {...props} />,
        code({node, inline, className, children, ...props}) {
          if (inline) {
            return (
              <code className={styles.inlineCode} {...props}>
                {children}
              </code>
            );
          }

          // Для fenced code блоков react-markdown сам рендерит <pre><code/>
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        input: ({node, ...props}) => (
          <input type="checkbox" className={styles.checkbox} disabled {...props} />
        ),
        p: ({node, ...props}) => <p className={styles.paragraph} {...props} />,
        li: ({node, ...props}) => <li className={styles.listItem} {...props} />,
      }}
    />
  </div>
);

export default NotionMarkdown; 