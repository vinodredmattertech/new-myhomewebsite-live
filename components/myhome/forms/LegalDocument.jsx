import React from "react";

const bodyCls =
  "font-montserrat text-[#555] text-[13px] sm:text-[14px] lg:text-[0.833vw] leading-[22px] sm:leading-[24px] lg:leading-[1.458vw]";
const headCls = "font-montserrat text-[#333] font-semibold text-[14px] sm:text-[15px] lg:text-[0.938vw] mt-[8px] lg:mt-[0.521vw]";

/** Turns each `{{Label}}` blank into the printed form's labelled dotted line. */
export function BlankText({ text }) {
  return String(text)
    .split(/(\{\{[^}]+\}\})/g)
    .map((part, i) => {
      const blank = part.match(/^\{\{([^}]+)\}\}$/);
      if (!blank) return <React.Fragment key={i}>{part}</React.Fragment>;
      return (
        <span
          key={i}
          className="inline-block border-b border-dashed border-[#999] px-[4px] text-[#999] italic text-[0.9em]"
        >
          {blank[1]}
        </span>
      );
    });
}

const LIST_STYLE = { alpha: "list-[upper-alpha]", roman: "list-[lower-roman]" };

/**
 * LegalDocument — renders transcribed legal copy (see lib/forms/vanaDocuments.js
 * for the block format) in the site's type: clause headings, justified
 * paragraphs, lettered/roman lists and bordered tables.
 */
export default function LegalDocument({ blocks = [] }) {
  return (
    <div className="flex flex-col gap-[12px] lg:gap-[0.781vw]">
      {blocks.map((b, i) => {
        if (b.h) return <h3 key={i} className={headCls}>{b.h}</h3>;
        if (b.caps)
          return (
            <p key={i} className={`${bodyCls} font-semibold text-[#333] text-center`}>
              {b.caps}
            </p>
          );
        if (b.list)
          return (
            <ol key={i} className={`${LIST_STYLE[b.style] || "list-decimal"} pl-[22px] lg:pl-[1.354vw] flex flex-col gap-[6px] lg:gap-[0.417vw]`}>
              {b.items.map((item, j) => (
                <li key={j} className={`${bodyCls} text-justify`}>
                  <BlankText text={item} />
                </li>
              ))}
            </ol>
          );
        if (b.table)
          return (
            <div key={i} className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse">
                <thead>
                  <tr className="bg-[#ef493d] text-white text-left">
                    {b.table.columns.map((c) => (
                      <th key={c} className="font-montserrat font-semibold align-top p-[10px] lg:p-[0.677vw] text-[12px] sm:text-[13px] lg:text-[0.781vw]">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.table.rows.map((row, r) => (
                    <tr key={r} className="border-b border-x border-[#33333333]">
                      {row.map((cell, c) => (
                        <td key={c} className={`align-top p-[10px] lg:p-[0.677vw] ${c > 0 ? "border-l border-[#33333333]" : ""} ${bodyCls}`}>
                          <BlankText text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        return (
          <p key={i} className={`${bodyCls} text-justify`}>
            <BlankText text={b.p} />
          </p>
        );
      })}
    </div>
  );
}
