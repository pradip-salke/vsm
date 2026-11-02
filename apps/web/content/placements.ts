export type PlacementAsset = { src: string; alt: string };

export const placementIntro = [
  'Placements is not a one-day process and we provide every student a platform with the best available resources in terms of learning, industry interaction, internships with actual hands-on learning to get a clear understanding of expectations which makes our students “Industry Ready” to help them become confident and ensure success.',
  'We continuously keep interacting with companies to ensure they seek highly motivated, passionate and eager to learn professionals. We endeavor to add new companies to our list of already existing ones throughout the year.',
  'The placement team has a wide spectrum of industries to access the needs and plays a dual role of mentors to our students and research insight to academic teams respectively to ensure students have an insight into the latest trends in the markets and is ready to adapt rapidly to the expectations of the organizations.',
];

export const recruiterAssets: PlacementAsset[] = [
  ['1702 Digital', 'Artboard-2.jpg'], ['Ans source', 'Artboard-3.jpg'], ['AU Small Finance Bank', 'Artboard-4.jpg'],
  ['Axis Bank', 'Artboard-5.jpg'], ['Blue Star', 'Artboard-6.jpg'], ['Cargosol', 'Artboard-7.jpg'],
  ['Cielo Systems', 'Artboard-8.jpg'], ['Airconditioning', 'Artboard-11.jpg'], ['IIFL Securities', 'Artboard-14.jpg'],
  ['IndusInd Bank', 'Artboard-16.jpg'], ['KANTAR', 'Artboard-19.jpg'], ['Ninety Nine Years', 'Artboard-1.jpg'],
  ['Club Mahindra', 'Artboard-9.jpg'], ['DCB Bank', 'Artboard-10.jpg'], ['easiloan', 'Artboard-12.jpg'],
  ['Expertrons Inspire Success', 'Artboard-13.jpg'], ['ImpactGuru', 'Artboard-15.jpg'], ['Jaro Education', 'Artboard-17.jpg'],
  ['K11 School of Fitness Sciences', 'Artboard-18.jpg'], ['Kotak Securities', 'Artboard-20.jpg'],
].map(([alt, file]) => ({ alt, src: `https://vsmedu.com/wp-content/uploads/2024/01/${file}` }));

export const placementBatches = [
  { label: 'PGDM 2022–24 Batch', href: '/placements/placement-records/pgdm-2022-24-batch/' },
  { label: 'PGDM 2021–23 Batch', href: '/placements/placement-records/pgdm-2021-23-batch/' },
];

export const currentBatchInternshipAssets: PlacementAsset[] = [
  's1-724x1024.jpeg', 's2-724x1024.jpeg', 's3-724x1024.jpeg',
].map((file, index) => ({
  src: `https://vsmedu.com/wp-content/uploads/2026/06/${file}`,
  alt: `Summer internship placement record ${index + 1}, PGDM batch 2025–27`,
}));

export const batch2022PlacementAssets: PlacementAsset[] = [
  'AAKANSHA-RAJESH-SHARMA_Post_V02.jpg', 'AKASHKUMAR-NAYAK_Post_V02.jpg', 'MANSI-MANISH-SHINDE_Post_V02.jpg',
  'NANDESH-ANIL-RINGE_Post.jpg', 'PRASHANT-SHASHIMOHAN-JHA_Post_V02.jpg', 'ROHAN-NAIR_Post.jpg',
  'SABEENA-ANSARI_Post_V02.jpg', 'SHUBHAM-MANDEWARIYA_Post.jpg', 'SIDDHA-DINKAR-PERVI_Post_V02.jpg',
  'Samruddhi-Kanade.jpg', 'Siddha-Pervi.jpg', 'YASHASHREE-WAGLE_Post_V02.jpg', 'VANSAJ-GUPTA_Post.jpg',
].map((file) => ({ src: `https://vsmedu.com/wp-content/uploads/2025/03/${file}`, alt: file.replace(/[_-]/g, ' ').replace(/\.[^.]+$/, '') }));

export const batch2022InternshipAssets: PlacementAsset[] = [
  'Internship_Prashant-Chavan.jpg', 'Internship_Nandesh-Ringe.jpg', 'Internship_Kalpesh-Suthar.jpg',
  'Internship_Binit-Kushwaha.jpg', 'Final-Placement_Sudha-Konar.jpg', 'Internship_Prashant-Jha.jpg',
].map((file) => ({ src: `https://vsmedu.com/wp-content/uploads/2024/04/${file}`, alt: file.replace(/[_-]/g, ' ').replace(/\.[^.]+$/, '') }));

export const batch2022Highlights = [
  ['100%', 'Internship Placement Percentage'], ['90', 'Number of Companies Participated'],
  ['2–4 Months', 'Maximum Internship Period'], ['₹15K / month', 'Average Stipend Offered'],
  ['₹35K / month', 'Highest Stipend Offered'], ['08', 'Number of PPOs Received'],
];

export const batch2021Highlights = [
  ['58', 'Total Participants in the batch'], ['84', 'Number of Companies Participated'],
  ['55', 'Total Number of Students Placed'], ['95%', 'Placement Percentage'],
  ['₹7–8.5 LPA', 'Average Salary Range Offered'], ['₹9–11.5 LPA', 'Highest Salary Range Offered'],
];

export const specializationPlacementRows = [
  ['Marketing', '23%', '16'], ['BFSI', '30%', '9'], ['HR', '17%', '11'],
  ['Operations', '15%', '9'], ['Business Analytics', '15%', '7'],
];

export const salaryPlacementRows = [
  ['Marketing', '₹7.5 LPA', '₹12.0 LPA'], ['BFSI', '₹8.0 LPA', '₹14.0 LPA'],
  ['HR', '₹7.5 LPA', '₹11.0 LPA'], ['Operations', '₹7.0 LPA', '₹9.0 LPA'],
  ['Business Analytics', '₹7.0 LPA', '₹15.0 LPA'],
];

export const alumniProfiles = [
  { name: 'Mr. Bhaskar Chatterjee', qualification: 'PGDM', bio: 'Member Secretary and Chief Executive Officer of the Indian Council of Social Science Research, New Delhi. He joined the Indian Administrative Service in July 1975 and has authored books on Japanese management and human resource management.' },
  { name: 'Mr. P K Gupta', qualification: 'PGDITM & DBA (Pursuing) · President, Alumni Association', bio: 'Director – Strategic Development, Intercontinental at Legato Systems. He completed PGDITM in 2000 and is pursuing a Doctorate in Business Administration from AMU.' },
  { name: 'Mr. K Ramalingam', qualification: 'PGDITM', bio: 'Member (Planning) at Airports Authority of India. He holds an M.Tech in Electrical Engineering from IIT Chennai and a Post Graduate Diploma in Management with a specialisation in Information Technology.' },
  { name: 'Mr. P. Jayakumar', qualification: 'PGDM & DBA (Pursuing)', bio: 'Founder President of the Alumni Association and Advisor, Business Development at Tata BP Solar India Limited, Delhi. He has over a decade of experience in renewable energy and business management.' },
];
