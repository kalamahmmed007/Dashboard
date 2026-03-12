// /components/tables/HeroSlidesTable.jsx
import React from "react";

const HeroSlidesTable = ({ slides }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full rounded-lg border border-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Subtitle</th>
            <th className="px-4 py-2 text-left">Image</th>
          </tr>
        </thead>
        <tbody>
          {slides.map((slide) => (
            <tr key={slide.id} className="border-t">
              <td className="px-4 py-2">{slide.id}</td>
              <td className="px-4 py-2">{slide.title}</td>
              <td className="px-4 py-2">{slide.subtitle}</td>
              <td className="px-4 py-2">
                <img src={slide.image} alt={slide.title} className="h-12 w-20 rounded object-cover"/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HeroSlidesTable;