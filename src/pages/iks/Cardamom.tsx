import React from "react";

export const Cardamom = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-green-700 mb-4">Cardamom Farming</h1>

      <img
        src="/cardamom.jpg"
        alt="Cardamom Farming"
        style={{ width: "100%", height: "auto", marginBottom: "20px" }}
      />

      <h2 className="text-2xl font-semibold">Cardamom Farming Guide</h2>
      <p>
        Cardamom (<em>Elettaria cardamomum</em>), known as the "Queen of Spices," is a highly valued spice native to the evergreen rainforests of the Western Ghats in South India. It is widely cultivated in Kerala, Karnataka, and Tamil Nadu, contributing significantly to India's spice exports.
      </p>

      <h3 className="text-xl font-semibold mt-4">Varieties of Cardamom</h3>
      <p>Cardamom varieties are classified based on their origin:</p>

      <h4 className="text-lg font-semibold mt-3">Malabar Variety</h4>
      <ul className="list-disc ml-6">
        <li>Mudigere 1, Mudigere 2, PV 1, PV 3, ICRI 1, ICRI 3, TKD 4</li>
        <li>IISR Suvarna, IISR Vijetha, IISR Avinash, TDK-11, CCS-1</li>
        <li>Suvasini, Avinash, Vijetha-1, Appangala 2, Njallani (Green Gold), ICRI 8</li>
      </ul>

      <h4 className="text-lg font-semibold mt-3">Mysore Variety</h4>
      <ul className="list-disc ml-6">
        <li>ICRI 2</li>
      </ul>

      <h4 className="text-lg font-semibold mt-3">Vazhukka Variety</h4>
      <ul className="list-disc ml-6">
        <li>MCC-12, MCC-16, MCC-40, PV 2, PV 5</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4">Ideal Growing Conditions</h3>
      <h4 className="text-lg font-semibold mt-3">Soil & Climate</h4>
      <p>Cardamom thrives in well-drained, loamy soils with a pH between 5.0 and 6.5. It requires humid, shady environments at elevations between 600 to 1,500 meters and avoids exposure to heavy winds.</p>

      <h3 className="text-xl font-semibold mt-4">Propagation Methods</h3>
      <h4 className="text-lg font-semibold mt-3">Seed Propagation</h4>
      <ul className="list-disc ml-6">
        <li>Seeds are collected from high-yielding plants.</li>
        <li>Pre-treated with sulfuric or hydrochloric acid for 20 minutes, then thoroughly washed.</li>
        <li>Sown in prepared nursery beds enriched with organic matter.</li>
        <li>Germination starts within a month and continues for up to three months.</li>
        <li>Seedlings are transplanted after reaching the 3-4 leaf stage.</li>
      </ul>

      <h4 className="text-lg font-semibold mt-3">Vegetative Propagation (Suckers)</h4>
      <ul className="list-disc ml-6">
        <li>Suckers with one mature tiller and a growing shoot are used.</li>
        <li>Rapid clonal multiplication techniques enhance propagation efficiency.</li>
        <li>Trenches are filled with topsoil, organic matter, and compost.</li>
        <li>Each plant produces 32-42 suckers annually, with 16-21 viable planting units per hectare.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4">Field Preparation & Planting</h3>
      <ul className="list-disc ml-6">
        <li>Pits of 60 cm x 60 cm x 60 cm are prepared and filled with compost.</li>
        <li>Contour planting is recommended in sloped areas.</li>
        <li>18-22 month-old seedlings are ideal for transplanting.</li>
        <li>Spacing: 2.5 x 2.0 meters for larger varieties, 2.0 x 1.5 meters for smaller varieties.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4">Irrigation & Fertilization</h3>
      <ul className="list-disc ml-6">
        <li>Sprinkler irrigation during dry periods improves yields.</li>
        <li>Recommended fertilization per hectare:
          <ul className="list-disc ml-6">
            <li>Compost: 25 tonnes</li>
            <li>NPK Fertilizer: 75 kg nitrogen, 75 kg phosphorus, 150 kg potassium</li>
          </ul>
        </li>
        <li>Fertilizer applied in two doses (June-July & October-November).</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4">Pest & Disease Management</h3>
      <h4 className="text-lg font-semibold mt-3">Common Pests</h4>
      <ul className="list-disc ml-6">
        <li>Leaf Thrips</li>
        <li>Shoot & Fruit Borers</li>
        <li>Root Grubs</li>
      </ul>
      <p>These pests are managed using integrated pest control methods, including pheromone traps.</p>

      <h4 className="text-lg font-semibold mt-3">Diseases</h4>
      <ul className="list-disc ml-6">
        <li><strong>Mosaic (Katte) Viral Disease</strong> – Spread by aphids.</li>
        <li><strong>Rhizome Rot</strong> – Prevented through proper drainage and cultural practices.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-4">Conclusion</h3>
      <p>Cardamom cultivation requires careful soil management, proper propagation techniques, and pest control strategies. By following these guidelines, farmers can achieve high yields and superior quality spice production.</p>
    </div>
  );
};
