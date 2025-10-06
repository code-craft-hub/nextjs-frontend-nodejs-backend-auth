import React from 'react';
import { Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EmailContentRendererProps {
  emailContent: string;
  className?: string;
}

interface ParsedSection {
  type: 'subject' | 'body' | 'signature' | 'notes' | 'example';
  content: string;
  title?: string;
}

export const DisplayGenerateEmailContent: React.FC<EmailContentRendererProps> = ({ 
  emailContent,
  className = ''
}) => {
  const parseEmailContent = (content: string): ParsedSection[] => {
    if (!content || typeof content !== 'string') {
      return [];
    }
    
    const sections: ParsedSection[] = [];
    const lines = content.split('\n');
    
    let currentSection: ParsedSection | null = null;
    let buffer: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect subject line
      if (line.startsWith('Subject:')) {
        if (currentSection) {
          currentSection.content = buffer.join('\n').trim();
          sections.push(currentSection);
          buffer = [];
        }
        currentSection = {
          type: 'subject',
          content: line.replace('Subject:', '').trim()
        };
        sections.push(currentSection);
        currentSection = null;
        continue;
      }
      
      // Detect important notes section
      if (line.includes('**Important Notes') || line.includes('Important Notes and Customization')) {
        if (currentSection) {
          currentSection.content = buffer.join('\n').trim();
          sections.push(currentSection);
          buffer = [];
        }
        currentSection = {
          type: 'notes',
          title: 'Important Notes & Customization Advice',
          content: ''
        };
        continue;
      }
      
      // Detect example section
      if (line.includes('**Example of Customization') || line.includes('Example of Customization')) {
        if (currentSection) {
          currentSection.content = buffer.join('\n').trim();
          sections.push(currentSection);
          buffer = [];
        }
        currentSection = {
          type: 'example',
          title: 'Example of Customization',
          content: ''
        };
        continue;
      }
      
      // Detect signature section
      if (line === 'Sincerely,' || line === 'Best regards,' || line === 'Best,') {
        if (currentSection && currentSection.type !== 'signature') {
          currentSection.content = buffer.join('\n').trim();
          sections.push(currentSection);
          buffer = [];
        }
        currentSection = {
          type: 'signature',
          content: line
        };
        buffer = [line];
        continue;
      }
      
      // Start body section if not in any section
      if (!currentSection && line && !line.startsWith('**')) {
        currentSection = {
          type: 'body',
          content: ''
        };
      }
      
      // Add line to buffer
      if (line || buffer.length > 0) {
        buffer.push(line);
      }
    }
    
    // Push final section
    if (currentSection) {
      currentSection.content = buffer.join('\n').trim();
      sections.push(currentSection);
    }
    
    return sections;
  };

  const formatTextContent = (text: string): React.ReactNode => {
    // Handle markdown bold
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      
      // Handle bracketed placeholders
      const bracketParts = part.split(/(\[.*?\])/g);
      return bracketParts.map((bracketPart, bIndex) => {
        if (bracketPart.startsWith('[') && bracketPart.endsWith(']')) {
          return (
            <span 
              key={`${index}-${bIndex}`}
              className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium text-sm border border-amber-200"
            >
              {bracketPart}
            </span>
          );
        }
        return bracketPart;
      });
    });
  };

  const renderSection = (section: ParsedSection, index: number) => {
    switch (section.type) {
      case 'subject':
        return (
          <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                  Subject Line
                </div>
                <div className="text-base font-medium text-gray-900">
                  {formatTextContent(section.content)}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'body':
        const paragraphs = section.content.split('\n\n').filter(p => p.trim());
        return (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Email Body
              </h3>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              {paragraphs.map((para, pIndex) => (
                <p key={pIndex} className="text-sm">
                  {(para)}
                  {/* {formatTextContent(para)} */}
                </p>
              ))}
            </div>
          </div>
        );
      
    //   case 'signature':
    //     const sigLines = section.content.split('\n').filter(l => l.trim());
    //     return (
    //       <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
    //         <div className="flex items-center gap-2 mb-3">
    //           <div className="w-1 h-4 bg-gray-600 rounded-full"></div>
    //           <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
    //             Signature
    //           </h3>
    //         </div>
    //         <div className="space-y-1">
    //           {sigLines.map((line, lIndex) => (
    //             <div key={lIndex} className="text-sm text-gray-700">
    //               {formatTextContent(line)}
    //             </div>
    //           ))}
    //         </div>
    //       </div>
    //     );
      
    //   case 'notes':
    //     const noteItems = section.content
    //       .split(/\n\*/)
    //       .map(item => item.trim())
    //       .filter(item => item && !item.includes('**Important Notes'));
        
    //     return (
    //       <div key={index} className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
    //         <div className="flex items-center gap-2 mb-4">
    //           <AlertCircle className="w-5 h-5 text-amber-600" />
    //           <h3 className="text-base font-bold text-amber-900">
    //             {section.title}
    //           </h3>
    //         </div>
    //         <div className="space-y-3">
    //           {noteItems.map((item, iIndex) => {
    //             const [title, ...rest] = item.split(':');
    //             const description = rest.join(':').trim();
                
    //             return (
    //               <div key={iIndex} className="flex gap-3">
    //                 <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
    //                 <div className="flex-1">
    //                   <div className="font-semibold text-amber-900 text-sm mb-1">
    //                     {formatTextContent(title.replace(/^\*+/, '').trim())}
    //                   </div>
    //                   {description && (
    //                     <div className="text-sm text-amber-800 leading-relaxed">
    //                       {formatTextContent(description)}
    //                     </div>
    //                   )}
    //                 </div>
    //               </div>
    //             );
    //           })}
    //         </div>
    //       </div>
    //     );
      
    //   case 'example':
    //     const exampleText = section.content
    //       .split('\n')
    //       .filter(l => l.trim() && !l.includes('**Example'))
    //       .join('\n');
        
    //     return (
    //       <div key={index} className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
    //         <div className="flex items-center gap-2 mb-4">
    //           <Lightbulb className="w-5 h-5 text-green-600" />
    //           <h3 className="text-base font-bold text-green-900">
    //             {section.title}
    //           </h3>
    //         </div>
    //         <div className="prose prose-sm max-w-none text-green-800 leading-relaxed whitespace-pre-wrap">
    //           {formatTextContent(exampleText)}
    //         </div>
    //       </div>
    //     );
      
      default:
        return null;
    }
  };

  const sections = parseEmailContent(emailContent);

  if (!sections || sections.length === 0) {
    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">
                AI-Generated Email Content
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500 py-8">
              No email content to display
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={"font-merriweather max-w-screen-lg"}>
      <div className="bg-white rounded-xl overflow-hidden">
        {/* Header */}
        <div className=" px-6 py-5">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 " />
            <h2 className="text-xl font-bold ">
               Email Content
            </h2>
          </div>
          <p className=" text-sm mt-2">
            Review and customize this draft before sending
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {sections.map((section, index) => renderSection(section, index))}
        
        </div>
      </div>
    </Card>
  );
};

