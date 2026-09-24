import * as React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

export interface FaqProps {
  items: FaqItem[];
  className?: string;
  defaultValue?: string;
}

export function Faq({ items, className = "", defaultValue }: FaqProps) {
  return (
    <Accordion.Root
      type="single"
      collapsible
      defaultValue={defaultValue}
      className={`w-full divide-y divide-[#E3E4E6] border-t border-b border-[#E3E4E6] ${className}`}
    >
      {items.map((item) => (
        <Accordion.Item key={item.id} value={item.id} className="overflow-hidden">
          <Accordion.Header className="flex">
            <Accordion.Trigger className="flex flex-1 items-center justify-between py-5 text-left text-[16px] font-medium text-[#171A20] transition-all hover:text-[#171A20]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20] [&[data-state=open]>svg]:rotate-180">
              <span>{item.question}</span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-[#5C5E62] transition-transform duration-200"
                aria-hidden="true"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-[15px] font-normal leading-relaxed text-[#5C5E62] pb-5 pr-6">
            {item.answer}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
