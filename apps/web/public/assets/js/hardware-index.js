// assets/js/hardware-index.js

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("hardwareCategories");
  if (!grid) return;

  const categories = [
    {
      slug: "ai-accelerators",
      title: "AI Accelerators",
      tagline: "PCIe • Edge AI",
      description: "On-device inference modules, NPUs and compact AI compute boards.",
      partner: "Open category → Premium OEM Partner",
      image: "assets/images/store/hardware/ai-accelerators.webp",
    },
    {
      slug: "dev-boards",
      title: "Developer Boards",
      tagline: "SBC • Prototyping",
      description: "Single-board computers and dev kits for rapid prototyping.",
      partner: "Open category → RGZTEC Hardware Partner",
      image: "assets/images/store/hardware/dev-boards.webp",
    },
    {
      slug: "embedded-computers",
      title: "Embedded & Edge Computers",
      tagline: "Fanless • Rugged",
      description: "Fanless box PCs and edge computers for field deployments.",
      partner: "Open category → Industrial Hardware Vendor",
      image: "assets/images/store/hardware/embedded-computers.webp",
    },
    {
      slug: "sensors",
      title: "Sensors & Modules",
      tagline: "Env • I²C",
      description: "Precision sensors and modular boards for data acquisition.",
      partner: "Open category → Sensor Design Partner",
      image: "assets/images/store/hardware/sensors.webp",
    },
    {
      slug: "medical-kits",
      title: "Medical Kits & Starter Packs",
      tagline: "Training • Lab Use",
      description: "Prototype-friendly medical starter kits for training, labs and simulation.",
      partner: "Open category → RGZTEC Lab Partner",
      image: "assets/images/store/hardware/medical-kits.webp",
    },
    {
      slug: "medical-tech",
      title: "Medical Technologies & Bio-Sensing",
      tagline: "ECG • Reference",
      description: "Reference boards and modules for health analytics and med-tech R&D.",
      partner: "Open category → Bio-Sensing Partner",
      image: "assets/images/store/hardware/medical-tech.webp",
    },
    {
      slug: "robotics",
      title: "Robotics & Motion",
      tagline: "Motor Driver • DC",
      description: "Motor drivers, controllers and motion kits for robots and automation.",
      partner: "Open category → Motion Control Partner",
      image: "assets/images/store/hardware/robotics.webp",
    },
    {
      slug: "iot-gateways",
      title: "IoT Gateways & Connectivity",
      tagline: "LTE • Edge",
      description: "Gateways and connectivity modules for fleet and field deployments.",
      partner: "Open category → Connectivity Partner",
      image: "assets/images/store/hardware/iot-gateways.webp",
    },
  ];

  grid.innerHTML = "";

  categories.forEach((cat) => {
    const card = document.createElement("a");
    card.className = "store-category-card";
    card.href = `listings.html?store=hardware&cat=${encodeURIComponent(cat.slug)}`;

    card.innerHTML = `
      <img src="${cat.image}" alt="${cat.title}" loading="lazy">
      <div>
        <div style="font-size:.8rem;color:#6b7280;margin-bottom:.15rem;">
          ${cat.tagline}
        </div>
        <h3>${cat.title}</h3>
        <p>${cat.description}</p>
        <p style="font-size:.8rem;color:#64748b;margin-top:.4rem;">
          ${cat.partner}
        </p>
      </div>
    `;

    grid.appendChild(card);
  });
});


