import React from "react";

export const Avocado = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Avocado Farming</h1>
      
      <img 
        src="/avocodo.jpg" 
        alt="Avocado Farming" 
        className="w-full h-auto rounded-lg mb-6"
      />
      
      <p className="text-lg">Avocado farming in India is emerging as a profitable venture due to the increasing demand for this nutritious fruit. If you're considering starting an avocado farm, this comprehensive guide will walk you through the essential steps to achieve success.</p>
      
      <h2 className="text-2xl font-semibold mt-4">Understanding Avocados</h2>
      <p className="text-lg">Avocados, originally from Mexico and Guatemala, are packed with healthy fats, vitamins, and minerals. Their health benefits and culinary versatility have led to a growing demand across India, making avocado farming a lucrative opportunity.</p>
      
      <h2 className="text-2xl font-semibold mt-4">Selecting the Right Avocado Variety</h2>
      <p className="text-lg">Choosing the correct avocado variety is crucial for successful cultivation. Consider factors like climate, soil type, and market demand.</p>
      
      <h3 className="text-xl font-semibold mt-3">Hass Avocado</h3>
      <ul className="list-disc list-inside ml-4 text-lg">
        <li><strong>Characteristics:</strong> Buttery texture, high oil content.</li>
        <li><strong>Suitability:</strong> Thrives in India's hot and humid climate and is resistant to diseases.</li>
      </ul>
      
      <h3 className="text-xl font-semibold mt-3">Fuerte Avocado</h3>
      <ul className="list-disc list-inside ml-4 text-lg">
        <li><strong>Characteristics:</strong> Medium-sized fruit with smooth skin and a creamy, mild taste.</li>
        <li><strong>Suitability:</strong> Adapts well to India's diverse climate conditions.</li>
      </ul>
      
      <h3 className="text-xl font-semibold mt-3">Indian Local Variety</h3>
      <ul className="list-disc list-inside ml-4 text-lg">
        <li><strong>Characteristics:</strong> Flavorful fruits with slightly lower oil content.</li>
        <li><strong>Suitability:</strong> Specifically adapted to Indian growing conditions, cultivated since 1941.</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mt-4">Climate and Soil Requirements</h2>
      <p className="text-lg">Avocado trees flourish in warm, humid climates with temperatures ranging between <strong>15°C and 30°C</strong>. They are sensitive to frost and require well-drained, sandy loam soils with a <strong>pH level between 6.0 and 7.0</strong>. Regions like <strong>Maharashtra, Karnataka, and Tamil Nadu</strong> provide optimal conditions for avocado cultivation.</p>
      
      <h2 className="text-2xl font-semibold mt-4">Land Preparation and Planting</h2>
      <ul className="list-disc list-inside ml-4 text-lg">
        <li><strong>Soil Testing:</strong> Conduct thorough soil tests to evaluate pH levels and nutrient content.</li>
        <li><strong>Land Preparation:</strong> In areas prone to waterlogging, use raised beds to improve drainage and prevent root diseases.</li>
        <li><strong>Planting Distance:</strong> Maintain a spacing of <strong>3.5 meters between plants</strong> and <strong>7 meters between rows</strong> to facilitate healthy canopy growth.</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mt-4">Irrigation and Water Management</h2>
      <ul className="list-disc list-inside ml-4 text-lg">
        <li>Use <strong>drip irrigation</strong> for optimal water delivery.</li>
        <li>Establish <strong>rainwater harvesting</strong> systems to conserve water during dry seasons.</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mt-4">Nutrient Management</h2>
      <ul className="list-disc list-inside ml-4 text-lg">
        <li>Apply organic fertilizers such as <strong>cow dung manure</strong> to improve soil fertility.</li>
        <li>Use <strong>mulching</strong> to retain moisture and prevent weed growth.</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mt-4">Pest and Disease Control</h2>
      <p className="text-lg">Avocado trees are susceptible to pests and diseases. Adopt <strong>Integrated Pest Management (IPM)</strong> strategies to protect your crops:</p>
      <ul className="list-disc list-inside ml-4 text-lg">
        <li>Regularly monitor for pests like mites and fruit flies.</li>
        <li>Use organic sprays like <strong>neem oil</strong> to control infestations.</li>
        <li>Prevent fungal infections by ensuring proper drainage and air circulation.</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mt-4">Marketing Your Avocado Produce</h2>
      <p className="text-lg">With the rising demand for avocados in India, adopting a strategic marketing approach will enhance your profits:</p>
      <ul className="list-disc list-inside ml-4 text-lg">
        <li><strong>Local Markets:</strong> Sell directly to consumers through local markets.</li>
        <li><strong>Retail Partnerships:</strong> Collaborate with supermarkets and health food stores.</li>
        <li><strong>Online Platforms:</strong> Utilize online marketplaces to reach a broader audience.</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mt-4">Conclusion</h2>
      <p className="text-lg">By following these best practices and staying updated on the latest agricultural techniques, you can build a successful avocado farming business in India. With the right approach, avocado cultivation can provide substantial returns while contributing to the growing demand for this superfood.</p>
    </div>
  );
};
<style jsx>{`
  .p-6 {
    text-align: left;
  }
  .text-lg {
    font-size: 0.875rem; /* Reduced font size */
  }
  .text-xl {
    font-size: 1rem; /* Reduced font size */
  }
  .text-2xl {
    font-size: 1.25rem; /* Reduced font size */
  }
  .text-3xl {
    font-size: 1.5rem; /* Reduced font size */
  }
`}</style>