import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/useTheme';

// Types
interface TrainingPoint {
  id: string;
  point: string;
  type: 'do' | 'avoid' | 'neutral';
}

interface Topic {
  id: string;
  title: string;
  category: string;
  description: string;
  whenToUse: string[];
  keyPoints: string[];
  trainingPoints: TrainingPoint[];
  socialMediaTips: {
    emphasize: string[];
    avoid: string[];
  };
  sampleQuestions: {
    question: string;
    response: string;
  }[];
  likes: number;
  dislikes: number;
}

// Demo Data - Trending Topics in Telangana
const DEMO_TOPICS: Topic[] = [
  {
    id: 't1',
    title: 'Water Supply & Irrigation',
    category: 'Infrastructure',
    likes: 245,
    dislikes: 12,
    description:
      'Guidelines for discussing water supply issues, irrigation projects, and water management in Telangana.',
    whenToUse: [
      'Public meetings in rural areas',
      'Media interviews about infrastructure',
      'Social media posts during monsoon season',
      'Village-level discussions',
    ],
    keyPoints: [
      'Highlight Mission Kakatiya achievements',
      'Emphasize farmer welfare and irrigation support',
      'Mention ongoing water supply projects',
      'Focus on sustainable water management',
    ],
    trainingPoints: [
      {
        id: 'tp1',
        point: 'Always acknowledge existing water challenges in the region',
        type: 'neutral',
      },
      {
        id: 'tp2',
        point: 'Emphasize government initiatives and progress made',
        type: 'do',
      },
      {
        id: 'tp3',
        point: 'Avoid making unrealistic promises about water supply timelines',
        type: 'avoid',
      },
      {
        id: 'tp4',
        point:
          'Use data and statistics when available (tank restoration numbers, irrigation coverage)',
        type: 'do',
      },
    ],
    socialMediaTips: {
      emphasize: [
        'Photos of restored tanks and irrigation projects',
        'Success stories from farmers',
        'Infrastructure development updates',
      ],
      avoid: [
        'Criticizing previous governments excessively',
        'Making comparisons with other states in negative context',
        'Promising specific dates without confirmation',
      ],
    },
    sampleQuestions: [
      {
        question: 'What is being done about water scarcity in our area?',
        response:
          'We are actively working on multiple fronts - Mission Kakatiya tank restoration, new irrigation projects, and improving water supply infrastructure. The focus is on both immediate relief and long-term sustainable solutions.',
      },
      {
        question: 'When will our village get regular water supply?',
        response:
          'Water supply projects are underway. I will check the specific timeline for your village and update you. The priority is ensuring quality and sustainable supply.',
      },
    ],
  },
  {
    id: 't2',
    title: 'Education & Skill Development',
    category: 'Social Welfare',
    description:
      'How to discuss education policies, skill development programs, and youth empowerment initiatives.',
    whenToUse: [
      'Youth gatherings and college events',
      'Parent-teacher meetings',
      'Skill development program launches',
      'Education-related social media posts',
    ],
    keyPoints: [
      'Highlight government scholarships and fee reimbursement',
      'Emphasize skill development and employment opportunities',
      'Mention quality education initiatives',
      'Focus on youth empowerment programs',
    ],
    trainingPoints: [
      {
        id: 'tp5',
        point: 'Always connect education to employment opportunities',
        type: 'do',
      },
      {
        id: 'tp6',
        point:
          'Avoid making promises about specific exam results or job placements',
        type: 'avoid',
      },
      {
        id: 'tp7',
        point: 'Emphasize skill development and practical learning',
        type: 'do',
      },
      {
        id: 'tp8',
        point:
          'Acknowledge challenges in education system while highlighting improvements',
        type: 'neutral',
      },
    ],
    socialMediaTips: {
      emphasize: [
        'Student success stories',
        'Scholarship distribution events',
        'Skill development program achievements',
        'New educational infrastructure',
      ],
      avoid: [
        'Comparing education systems negatively',
        'Making unverified claims about pass percentages',
        'Political statements about education policies',
      ],
    },
    sampleQuestions: [
      {
        question: 'What opportunities are available for unemployed youth?',
        response:
          'We have multiple skill development programs, job fairs, and training initiatives. The focus is on creating local employment opportunities and connecting youth with industries.',
      },
      {
        question: 'How can students get scholarships?',
        response:
          'Various scholarship schemes are available through government portals. I can help you access the right information and application process for eligible students.',
      },
    ],
    likes: 198,
    dislikes: 8,
  },
  {
    id: 't3',
    title: 'Healthcare & Medical Services',
    category: 'Public Health',
    description:
      'Guidelines for discussing healthcare facilities, medical services, and public health initiatives.',
    whenToUse: [
      'Health camp announcements',
      'Hospital visits and inaugurations',
      'Public health awareness campaigns',
      'Media discussions about healthcare',
    ],
    keyPoints: [
      'Highlight Aarogyasri and health insurance schemes',
      'Emphasize new healthcare infrastructure',
      'Mention preventive healthcare initiatives',
      'Focus on accessibility and affordability',
    ],
    trainingPoints: [
      {
        id: 'tp9',
        point: 'Always emphasize preventive healthcare and awareness',
        type: 'do',
      },
      {
        id: 'tp10',
        point:
          'Avoid making specific medical claims or guarantees about treatments',
        type: 'avoid',
      },
      {
        id: 'tp11',
        point: 'Highlight government health schemes and their benefits',
        type: 'do',
      },
      {
        id: 'tp12',
        point:
          'Acknowledge healthcare challenges while showing commitment to improvement',
        type: 'neutral',
      },
    ],
    socialMediaTips: {
      emphasize: [
        'Health camp photos and success stories',
        'New hospital facilities and equipment',
        'Aarogyasri beneficiary stories',
        'Public health awareness messages',
      ],
      avoid: [
        'Sharing unverified medical information',
        'Making claims about specific disease cures',
        'Political statements during health crises',
      ],
    },
    sampleQuestions: [
      {
        question: 'What healthcare facilities are available in our area?',
        response:
          'We have primary health centers, Aarogyasri coverage, and regular health camps. The focus is on making quality healthcare accessible and affordable for all.',
      },
      {
        question: 'How can people access free medical treatment?',
        response:
          'Aarogyasri scheme provides coverage for various treatments. I can help you understand the eligibility and enrollment process for your family.',
      },
    ],
    likes: 312,
    dislikes: 15,
  },
  {
    id: 't4',
    title: 'Agriculture & Farmer Welfare',
    category: 'Agriculture',
    description:
      'How to discuss agricultural policies, farmer support schemes, and rural development initiatives.',
    whenToUse: [
      'Farmer meetings and agricultural events',
      'Crop loan and insurance discussions',
      'Rythu Bandhu and other scheme announcements',
      'Agricultural crisis situations',
    ],
    keyPoints: [
      'Highlight Rythu Bandhu and support schemes',
      'Emphasize crop insurance and loan facilities',
      'Mention market linkages and MSP support',
      'Focus on farmer income and welfare',
    ],
    trainingPoints: [
      {
        id: 'tp13',
        point: 'Always acknowledge farmers as the backbone of the economy',
        type: 'do',
      },
      {
        id: 'tp14',
        point:
          'Avoid making promises about specific crop prices or MSP without confirmation',
        type: 'avoid',
      },
      {
        id: 'tp15',
        point: 'Emphasize government support schemes and their impact',
        type: 'do',
      },
      {
        id: 'tp16',
        point:
          'Show empathy for agricultural challenges while highlighting support measures',
        type: 'neutral',
      },
    ],
    socialMediaTips: {
      emphasize: [
        'Farmer success stories and crop yields',
        'Rythu Bandhu distribution events',
        'Agricultural infrastructure development',
        'Farmer welfare scheme benefits',
      ],
      avoid: [
        'Making unverified claims about crop prices',
        'Political statements during agricultural crises',
        'Comparing farmer situations negatively',
      ],
    },
    sampleQuestions: [
      {
        question: 'What support is available for farmers during crop failure?',
        response:
          'We have crop insurance schemes, relief measures, and support programs. I will help you access the right assistance and ensure timely support during difficult times.',
      },
      {
        question: 'When will Rythu Bandhu be distributed?',
        response:
          'Rythu Bandhu distribution follows a scheduled process. I can check the timeline for your area and ensure you receive the benefits on time.',
      },
    ],
    likes: 267,
    dislikes: 10,
  },
  {
    id: 't5',
    title: 'Employment & Job Creation',
    category: 'Employment',
    description:
      'Guidelines for discussing employment opportunities, job creation, and industrial development.',
    whenToUse: [
      'Job fair announcements',
      'Industrial investment discussions',
      'Youth employment programs',
      'Skill development initiatives',
    ],
    keyPoints: [
      'Highlight local employment opportunities',
      'Emphasize skill development and training',
      'Mention industrial investments and job creation',
      'Focus on youth employment programs',
    ],
    trainingPoints: [
      {
        id: 'tp17',
        point: 'Always connect training to actual employment opportunities',
        type: 'do',
      },
      {
        id: 'tp18',
        point: 'Avoid promising specific number of jobs without confirmation',
        type: 'avoid',
      },
      {
        id: 'tp19',
        point: 'Emphasize local employment over migration',
        type: 'do',
      },
      {
        id: 'tp20',
        point:
          'Show commitment to creating opportunities while being realistic',
        type: 'neutral',
      },
    ],
    socialMediaTips: {
      emphasize: [
        'Job fair photos and success stories',
        'New industrial investments',
        'Skill development program completions',
        'Employment generation statistics',
      ],
      avoid: [
        'Making unverified claims about job numbers',
        'Promising specific jobs to individuals',
        'Political statements about employment data',
      ],
    },
    sampleQuestions: [
      {
        question: 'What job opportunities are available for local youth?',
        response:
          'We have multiple initiatives - skill development programs, job fairs, and efforts to bring industries that create local employment. The focus is on reducing migration and creating opportunities here.',
      },
      {
        question: 'How can unemployed youth get training?',
        response:
          'Various skill development programs are available. I can help you identify the right training program based on your interests and connect you with employment opportunities.',
      },
    ],
    likes: 189,
    dislikes: 6,
  },
  {
    id: 't6',
    title: 'Women Empowerment & Safety',
    category: 'Social Welfare',
    description:
      'How to discuss women empowerment schemes, safety initiatives, and gender equality programs.',
    whenToUse: [
      "Women's day events and celebrations",
      'Safety awareness campaigns',
      'Women welfare scheme announcements',
      'Gender equality discussions',
    ],
    keyPoints: [
      'Highlight women welfare schemes and support',
      'Emphasize safety and security measures',
      'Mention economic empowerment programs',
      'Focus on equal opportunities and rights',
    ],
    trainingPoints: [
      {
        id: 'tp21',
        point: 'Always emphasize respect and equal opportunities for women',
        type: 'do',
      },
      {
        id: 'tp22',
        point: 'Avoid making gender-stereotyped statements',
        type: 'avoid',
      },
      {
        id: 'tp23',
        point: "Highlight women's achievements and contributions",
        type: 'do',
      },
      {
        id: 'tp24',
        point: "Show commitment to women's safety and empowerment",
        type: 'neutral',
      },
    ],
    socialMediaTips: {
      emphasize: [
        'Women success stories and achievements',
        'Women welfare scheme benefits',
        'Safety awareness campaigns',
        "Women's participation in development",
      ],
      avoid: [
        "Making insensitive comments about women's issues",
        'Political statements during sensitive situations',
        'Gender-stereotyped content',
      ],
    },
    sampleQuestions: [
      {
        question: 'What schemes are available for women?',
        response:
          'We have various women welfare schemes covering health, education, economic empowerment, and safety. I can help you access the right schemes based on your needs.',
      },
      {
        question: "What measures are in place for women's safety?",
        response:
          'Safety is a priority. We have helplines, support systems, and awareness programs. I will ensure that safety measures are strengthened in our area.',
      },
    ],
    likes: 223,
    dislikes: 9,
  },
  {
    id: 't7',
    title: 'Infrastructure Development',
    category: 'Infrastructure',
    description:
      'Guidelines for discussing roads, bridges, public buildings, and infrastructure projects.',
    whenToUse: [
      'Infrastructure project inaugurations',
      'Road and bridge construction discussions',
      'Public building openings',
      'Development project announcements',
    ],
    keyPoints: [
      'Highlight completed infrastructure projects',
      'Emphasize connectivity and development',
      'Mention ongoing and planned projects',
      'Focus on public benefit and accessibility',
    ],
    trainingPoints: [
      {
        id: 'tp25',
        point:
          'Always connect infrastructure to public benefit and development',
        type: 'do',
      },
      {
        id: 'tp26',
        point:
          'Avoid making promises about specific completion dates without confirmation',
        type: 'avoid',
      },
      {
        id: 'tp27',
        point: 'Emphasize long-term benefits and connectivity improvements',
        type: 'do',
      },
      {
        id: 'tp28',
        point: 'Acknowledge infrastructure needs while showing progress',
        type: 'neutral',
      },
    ],
    socialMediaTips: {
      emphasize: [
        'Before/after photos of infrastructure projects',
        'Inauguration events and public benefits',
        'Connectivity improvements',
        'Development statistics',
      ],
      avoid: [
        'Making unverified claims about project timelines',
        'Political comparisons during project delays',
        'Unrealistic promises about infrastructure',
      ],
    },
    sampleQuestions: [
      {
        question: 'When will the new road be completed?',
        response:
          'The road project is progressing well. I will check the current status and provide you with an updated timeline. The focus is on quality and timely completion.',
      },
      {
        question: 'What infrastructure projects are planned for our area?',
        response:
          'Several infrastructure projects are in the pipeline - roads, water supply, and public facilities. I will share the details and ensure community needs are prioritized.',
      },
    ],
    likes: 156,
    dislikes: 5,
  },
  {
    id: 't8',
    title: 'Social Media Best Practices',
    category: 'Communication',
    description:
      'General guidelines for effective and safe social media communication for leaders.',
    whenToUse: [
      'Before posting on social media',
      'Responding to comments and messages',
      'Handling social media controversies',
      'Building positive online presence',
    ],
    keyPoints: [
      'Maintain professional and respectful tone',
      'Focus on development and public welfare',
      'Share positive stories and achievements',
      'Engage constructively with followers',
    ],
    trainingPoints: [
      {
        id: 'tp29',
        point: 'Always verify information before sharing',
        type: 'do',
      },
      {
        id: 'tp30',
        point: 'Avoid responding to negative comments impulsively',
        type: 'avoid',
      },
      {
        id: 'tp31',
        point:
          'Use social media to highlight positive work and connect with people',
        type: 'do',
      },
      {
        id: 'tp32',
        point: 'Maintain consistency between offline and online messaging',
        type: 'neutral',
      },
    ],
    socialMediaTips: {
      emphasize: [
        'Development work and achievements',
        'Public welfare initiatives',
        'Community engagement and events',
        'Positive stories and success cases',
      ],
      avoid: [
        'Personal attacks or negative political statements',
        'Unverified information or rumors',
        'Sensitive topics without proper context',
        'Controversial statements that may cause division',
      ],
    },
    sampleQuestions: [
      {
        question: 'How should I respond to negative comments on social media?',
        response:
          'Stay calm and professional. Address genuine concerns constructively. Avoid personal attacks. Focus on facts and positive work. If needed, take the conversation offline.',
      },
      {
        question: 'What should I post on social media?',
        response:
          'Focus on development work, public welfare initiatives, community events, and positive achievements. Keep it professional, informative, and engaging.',
      },
    ],
    likes: 178,
    dislikes: 7,
  },
  {
    id: 't9',
    title: 'పారిశ్రామిక భూముల వ్యవహారం & ప్రభుత్వ బాధ్యత',
    category: 'Public Issues',
    description:
      'హైదరాబాద్‌లో పారిశ్రామిక భూముల కేటాయింపు, ప్రభుత్వ పారదర్శకత, భూములపై బాధ్యత గురించి సురక్షితంగా, వాస్తవాల ఆధారంగా ఎలా మాట్లాడాలో మార్గదర్శకం.',
    whenToUse: [
      'పారిశ్రామిక వాడల భూములపై ప్రజా సమావేశాలు జరుగుతుంటే',
      'భూముల కేటాయింపు / లీజులు / ఆక్రమణలపై చర్చలు జరిగేటప్పుడు',
      'ప్రభుత్వ పారదర్శకత, బాధ్యత గురించి ప్రశ్నలు వచ్చినప్పుడు',
      'సోషల్ మీడియాలో భూముల దోపిడీ, అవకతవకల ఆరోపణలు వైరల్ అవుతున్నప్పుడు',
    ],
    keyPoints: [
      'భూముల కేటాయింపులో పారదర్శక విధానాలు, స్పష్టమైన నిబంధనలు ఉన్నాయనే విషయాన్ని ముందుకు తేవాలి',
      'ప్రతి లావాదేవీకి సంబంధించిన ఆధారాలు (GOలు, రికార్డులు, లీజు పత్రాలు) అవసరమని చెప్పాలి',
      'ప్రజా సంపద, ప్రభుత్వ భూములు ప్రైవేట్ ప్రయోజనాల కోసం దుర్వినియోగం కాకూడదనే ఆలోచనను బలంగా చెప్పాలి',
      'ప్రతి ఆరోపణ కూడా చట్టపరమైన ప్రక్రియ, విచారణ, ఆడిట్ నివేదికల ఆధారంగా సమీక్షించాలని చెప్పాలి',
    ],
    trainingPoints: [
      {
        id: 'tp33',
        point:
          'భూముల వ్యవహారంపై మాట్లాడేటప్పుడు ఎప్పుడూ పారదర్శకత, చట్టపరమైన ప్రక్రియల ప్రాముఖ్యతను హైలైట్ చేయాలి',
        type: 'do',
      },
      {
        id: 'tp34',
        point:
          'ఆరోపణలు చేయాల్సి వస్తే, వ్యక్తుల పేర్లు / అంకెలు చెప్పే ముందు పూర్తి ఆధారాలు, డాక్యుమెంట్లు ఉన్నాయా లేదా చూసుకోవాలి',
        type: 'avoid',
      },
      {
        id: 'tp35',
        point:
          'ఏ ప్రభుత్వం అయినా ప్రజల భూముల విషయంలో జవాబుదారీతనం చూపాలి, అన్ని నిర్ణయాలు రికార్డ్‌లో ఉండాలన్న మెసేజ్ ఇవ్వాలి',
        type: 'do',
      },
      {
        id: 'tp36',
        point:
          'ప్రజల్లో ఉన్న అనుమానాలను గుర్తించి, వాటిని చట్టపరమైన వ్యవస్థల (కోర్టులు, విచారణలు, ఆడిట్లు) ద్వారా ఎలా క్లియర్ చేయాలో వివరించాలి',
        type: 'neutral',
      },
    ],
    socialMediaTips: {
      emphasize: [
        'ప్రభుత్వ నిర్ణయాలు, భూముల కేటాయింపు ప్రక్రియలపై స్పష్టమైన సమాచారం',
        'ఆడిట్ నివేదికలు, కోర్టు తీర్పులు, అధికారిక డేటా వంటి నమ్మకమైన ఆధారాలు',
        'ప్రజా భూముల సంరక్షణ, భవిష్యత్ తరాల కోసం రక్షణ అనే పాజిటివ్ మెసేజ్',
        'సంబంధిత శాఖల చర్యలు, రూల్ బుక్ ప్రకారం జరుగుతున్న సరిదిద్దే చర్యలు',
      ],
      avoid: [
        '“లక్షల కోట్ల దోపిడీ” వంటి అంకెలు ఆధారాలు లేకుండా చెప్పడం',
        'వ్యక్తిగత దూషణలు, పేరుపేరున ఆరోపణలు',
        'కోర్టు లేదా విచారణలు జరుగుతున్నప్పుడు వాటిపై ముందుగానే తీర్పు చెప్పే విధమైన పోస్ట్‌లు',
        'సోషల్ మీడియాలో ఒక్క వైరల్ పోస్ట్ ఆధారంగా సంచలనాత్మక ఆరోపణలు చేయడం',
      ],
    },
    sampleQuestions: [
      {
        question:
          'హైదరాబాద్‌లో పారిశ్రామిక భూముల కేటాయింపులో పారదర్శకత గురించి ఏమి చేస్తున్నారు?',
        response:
          'పారిశ్రామిక భూముల కేటాయింపు పూర్తి చట్టపరమైన ప్రక్రియల ద్వారా మాత్రమే జరుగుతుంది. సంబంధిత GOలు, రికార్డులు, కమిటీ సిఫారసులు అన్నీ రికార్డ్‌లో ఉంటాయి. ఏవైనా అనుమానాలు ఉంటే అధికారికంగా ఫిర్యాదు చేసి, విచారణ కోరడం ఉత్తమ మార్గం.',
      },
      {
        question: 'ప్రజలకు చెందిన భూములు సరిగ్గా వినియోగం కావాలంటే ఏమి చేయాలి?',
        response:
          'ప్రతి నిర్ణయం డాక్యుమెంట్‌లో ఉండాలి, చట్టానికి లోబడి ఉండాలి, ఎవరికీ ప్రత్యేక ప్రయోజనం కలిగించే విధంగా కాకుండా ప్రజా ప్రయోజనానికి ఉపయోగపడేలా ఉండాలి. ఏ నిర్ణయంపై అనుమానం ఉన్నా విచారణ, ఆడిట్, కోర్టు వంటి చట్టపరమైన మార్గాల ద్వారా స్పష్టత వచ్చేలా చూసుకోవాలి.',
      },
    ],
    likes: 420,
    dislikes: 18,
  },
  {
    id: 't10',
    title: 'ఇసుక తవ్వకం & పర్యావరణ రక్షణ',
    category: 'Environmental',
    description:
      'ఇసుక తవ్వకం, చెక్‌డ్యామ్‌లు, నదీ పరిరక్షణ, అక్రమ ఇసుక మాఫియా వంటి విషయాలపై బాధ్యతాయుతంగా, చట్టపరంగా ఎలా మాట్లాడాలో మార్గదర్శనం.',
    whenToUse: [
      'నదీ పరిరక్షణ, చెక్‌డ్యామ్‌లు, రిజర్వాయర్ల గురించి ప్రజా చర్చలు జరుగుతున్నప్పుడు',
      'అక్రమ ఇసుక రవాణా, మాఫియా గురించి మీడియా ప్రశ్నించినప్పుడు',
      'పర్యావరణ సంరక్షణపై అవగాహన కార్యక్రమాలు, ర్యాలీల్లో మాట్లాడేటప్పుడు',
      'సోషల్ మీడియాలో ఇసుక తవ్వకం ఫోటోలు / వీడియోలు వైరల్ అవుతున్నప్పుడు',
    ],
    keyPoints: [
      'ఇసుక తవ్వకం కూడా పర్యావరణానికి హాని చేయకుండా, నిబంధనలు పాటిస్తూ జరగాల్సిన అవసరాన్ని చెప్పాలి',
      'నదీతట్టు, చెక్‌డ్యామ్‌లు, సాగు నీటి ప్రాజెక్టులు దెబ్బతినకూడదనే దృష్టితో మాట్లాడాలి',
      'చెల్లుబాటు అయ్యే పర్మిట్లు లేకుండా తవ్వకం, రవాణా చేయడం చట్టవిరుద్ధమని స్పష్టంగా చెప్పాలి',
      'కోర్టు, గ్రీన్ ట్రిబ్యునల్, పర్యావరణ చట్టాలు ఏం చెబుతున్నాయో ఆధారాలతో వివరించాలి',
    ],
    trainingPoints: [
      {
        id: 'tp37',
        point:
          'ప్రతి ప్రసంగంలో ఇసుక తవ్వకం కంటే ముందు నదులు, చెక్‌డ్యామ్‌లు, రైతుల సాగు నీటి అవసరాల పరిరక్షణను హైలైట్ చేయాలి',
        type: 'do',
      },
      {
        id: 'tp38',
        point:
          'ఏ వ్యక్తి లేదా ప్రాజెక్ట్‌పై ఆధారాలు లేకుండా తీవ్రమైన ఆరోపణలు చేయకూడదు; “మాఫియా” అని సాధారణంగా పరిస్థితిని మాత్రమే సూచిస్తూ మాట్లాడాలి',
        type: 'avoid',
      },
      {
        id: 'tp39',
        point:
          'నిబంధనలు ఉల్లంఘిస్తే ఎవరికైనా కఠిన చర్యలు తప్పవని, దీనిలో రాజకీయ భేదాభిప్రాయాలు ఉండకూడదని స్పష్టం చేయాలి',
        type: 'do',
      },
      {
        id: 'tp40',
        point:
          'ప్రజల్లో ఉన్న ఆందోళనలు అర్థం చేసుకుని, ప్రభుత్వానికి ఉన్న చట్టపరమైన బాధ్యతలు, నిబంధనలు, పర్యావరణ చట్టాలను వివరించాలి',
        type: 'neutral',
      },
    ],
    socialMediaTips: {
      emphasize: [
        'నదీ పరిరక్షణ, చెక్‌డ్యామ్‌ల రక్షణ, చెట్ల పెంపు వంటి పాజిటివ్ మెసేజ్‌లు',
        'కోర్టు / గ్రీన్ ట్రిబ్యునల్ ఆదేశాలు, ప్రభుత్వ అధికారిక మార్గదర్శకాలు',
        'చట్టబద్ధమైన అనుమతులు, నియంత్రణ చర్యల గురించి క్లియర్ సమాచారం',
        'సుస్థిర ఇసుక తవ్వకం లేదా ప్రత్యామ్నాయ నిర్మాణ పదార్థాలపై అవగాహన',
      ],
      avoid: [
        'ఒక్క వీడియో, ఒక్క ఫోటో ఆధారంగా మొత్తం ప్రాజెక్ట్ లేదా నాయకత్వంపై తీవ్ర ఆరోపణలు',
        'వ్యక్తిగత దూషణలు, పేరుపేరున “మాఫియా” అని పోస్టులు పెట్టడం',
        'నదీ ప్రాజెక్టులపై టెక్నికల్ సమాచారం లేకపోయినా తప్పుగా అర్ధం చేసుకొని వ్యాఖ్యలు చేయడం',
        'చట్టపరమైన వివరాలు లేకుండా కోర్టుపై, సంస్థలపై విమర్శలు',
      ],
    },
    sampleQuestions: [
      {
        question:
          'అక్రమ ఇసుక తవ్వకాన్ని అరికట్టడానికి ఏ చర్యలు తీసుకుంటున్నారు?',
        response:
          'ప్రస్తుత చట్టాల ప్రకారం ప్రత్యేక టాస్క్‌ఫోర్స్, సర్వేలు, రైడ్లు, కేసులు నమోదు వంటి చర్యలు కొనసాగుతున్నాయి. అనుమతి లేకుండా తవ్వకం లేదా రవాణా చేస్తే కేసులు, జరిమానాలు విధించే అధికారాలు అధికారులకు ఉన్నాయి. ప్రజలు కూడా  హెల్ప్‌లైన్‌ల ద్వారా ఫిర్యాదులు చేయగలరు.',
      },
      {
        question:
          'చెక్‌డ్యామ్‌లు, నీటి ప్రాజెక్టులు దెబ్బతినకుండా ఎలా కాపాడుతున్నారు?',
        response:
          'చెక్‌డ్యామ్‌లు, లిఫ్ట్ ఇరిగేషన్, రిజర్వాయర్లు ఇవన్నీ రాష్ట్రానికి దీర్ఘకాలిక ఆస్తులు. వాటి పరిసరాల్లో అక్రమ తవ్వకం పూర్తిగా నిషేధం. అలాంటి కేసులు బయటకు వస్తే సంబంధిత శాఖల ద్వారా తక్షణ చర్యలు, రికవరీ, రీస్టోరేషన్ పనులు జరుగుతాయి.',
      },
    ],
    likes: 385,
    dislikes: 15,
  },
  {
    id: 't11',
    title: 'రిజర్వేషన్లు & చట్టపరమైన ప్రక్రియలు',
    category: 'Social Welfare',
    description:
      'బీసీ/ఎస్సీ/ఎస్సీ/ఇతర రిజర్వేషన్ విధానాలు, కోర్టు వ్యవహారాలు, సామాజిక న్యాయంపై మాట్లాడేటప్పుడు సురక్షితమైన, బాధ్యతాయుతమైన పాయింట్లు.',
    whenToUse: [
      'రిజర్వేషన్లపై కోర్టు కేసులు, తీర్పులు వార్తల్లోకి వచ్చినప్పుడు',
      'బీసీ/ఎస్సీ/ఎస్టీ రిజర్వేషన్ శాతం, స్థానాల కేటాయింపుపై చర్చలు జరిగేటప్పుడు',
      'ఎన్నికల షెడ్యూల్, కోర్టు విచారణలు ఒకేసారి జరుగుతున్న సందర్భాల్లో',
      'సామాజిక న్యాయం, సమాన అవకాశాల గురించి ప్రజా వేదికలపై మాట్లాడేటప్పుడు',
    ],
    keyPoints: [
      'కోర్టు కేసులు నడుస్తున్నప్పుడు వాటిపై గౌరవంగా, స్తబ్దంగా మాట్లాడాలి; ముందుగానే తీర్పు చెప్పకూడదు',
      'రిజర్వేషన్ల విషయంలో కూడా చట్టపరమైన ప్రక్రియ, కమిషన్ నివేదికలు, డేటా వంటి అంశాల ప్రాముఖ్యతను హైలైట్ చేయాలి',
      'సామాజిక న్యాయం కోసం రిజర్వేషన్లు అవసరమని, కానీ ఎలా అమలు చేయాలో కోర్టులు, రాజ్యాంగం నిర్ణయిస్తాయని చెప్పాలి',
      'ప్రజలను రగిలించే బదులుగా, చట్టపరమైన మార్గాలు, అప్పీలు, విచారణల గురించి శాంతంగా వివరించాలి',
    ],
    trainingPoints: [
      {
        id: 'tp41',
        point:
          'ఎప్పుడూ కోర్టు వ్యవస్థపై గౌరవం చూపుతూ మాట్లాడాలి; తీర్పు నచ్చకపోయినా చట్టపరమైన మార్గాలు ఉన్నాయని చెప్పాలి',
        type: 'do',
      },
      {
        id: 'tp42',
        point:
          'తీర్పు వచ్చే ముందు “ఇలా వస్తుంది, అలాగా వస్తుంది” అని ఊహాగానాలు చేయకుండా ఉండాలి',
        type: 'avoid',
      },
      {
        id: 'tp43',
        point:
          'సామాజిక న్యాయం కోసం కట్టుబడి ఉన్నామని, కానీ ప్రతి చర్య కూడా రాజ్యాంగం, కోర్టు మార్గదర్శకాల ప్రకారమే సాగాలని హైలైట్ చేయాలి',
        type: 'do',
      },
      {
        id: 'tp44',
        point:
          'ప్రజల్లో ఉన్న ఆందోళనలు అర్ధం చేసుకుంటూ, కోర్టు ప్రక్రియలు సమయం పడతాయని, అందరూ ఓర్పుతో చట్టపరమైన మార్గాలను గౌరవించాలని చెప్పాలి',
        type: 'neutral',
      },
    ],
    socialMediaTips: {
      emphasize: [
        'కోర్టు తీర్పులపై గౌరవ భావన, చట్టపరమైన మార్గాలపై అవగాహన',
        'రిజర్వేషన్ల అవసరం, సామాజిక న్యాయం గురించి వాస్తవాధారిత పాయింట్లు',
        'అధికారిక రికార్డులు, కమిషన్ నివేదికలు, గణాంకాలు',
        'భిన్న వర్గాల మధ్య సమన్వయం, శాంతి, పరస్పర గౌరవం',
      ],
      avoid: [
        '“కోర్టు ఇలా తీర్పు ఇస్తుంది” అంటూ ముందుగానే పోస్టులు పెట్టడం',
        'ఎన్నికల షెడ్యూల్‌ను కోర్టు కేసులతో అనుసంధానం చేస్తూ కుట్ర ఆరోపణలు',
        'రిజర్వేషన్ శాతం, స్థానాల సంఖ్యపై అధికారిక డేటా లేకుండా గందరగోళం కలిగించే మెసేజ్‌లు',
        'పెండింగ్‌లో ఉన్న కేసులపై రాజకీయంగా ప్రేరేపించే స్టేట్‌మెంట్‌లు',
      ],
    },
    sampleQuestions: [
      {
        question: 'What is the status of reservation policies?',
        response:
          'Reservation policies are important for social justice. We respect the legal process and await court decisions. All matters should be handled through proper legal channels and due process.',
      },
      {
        question: 'How are reservation policies being implemented?',
        response:
          'Reservation policies are implemented according to legal frameworks and court guidelines. We support social justice and equal opportunities while following all legal procedures and respecting court decisions.',
      },
    ],
    likes: 398,
    dislikes: 12,
  },
];

type CategoryFilter = 'Trending' | 'All' | string;

export const TopicRecommendationScreen: React.FC = () => {
  const colors = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>('Trending');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>(DEMO_TOPICS);
  const [userLikes, setUserLikes] = useState<
    Record<string, 'like' | 'dislike' | null>
  >({});

  const categories = useMemo(() => {
    const cats = ['Trending', 'All', ...new Set(topics.map(t => t.category))];
    return cats;
  }, [topics]);

  const filteredTopics = useMemo(() => {
    let filtered = [...topics];

    // Apply category filter
    if (selectedCategory === 'Trending') {
      // Sort by likes (descending) for trending - show most liked topics first
      filtered = filtered.sort((a, b) => b.likes - a.likes);
    } else if (selectedCategory !== 'All') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.keyPoints.some(kp => kp.toLowerCase().includes(query)),
      );
    }

    // If trending and search is applied, re-sort by likes
    if (selectedCategory === 'Trending') {
      filtered = filtered.sort((a, b) => b.likes - a.likes);
    }

    return filtered;
  }, [searchQuery, selectedCategory, topics]);

  const toggleTopic = (topicId: string) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  const handleLike = (topicId: string) => {
    const currentAction = userLikes[topicId];
    setTopics(prevTopics =>
      prevTopics.map(topic => {
        if (topic.id === topicId) {
          let newLikes = topic.likes;
          let newDislikes = topic.dislikes;

          if (currentAction === 'like') {
            // Remove like
            newLikes = Math.max(0, topic.likes - 1);
            setUserLikes(prev => ({ ...prev, [topicId]: null }));
          } else if (currentAction === 'dislike') {
            // Switch from dislike to like
            newDislikes = Math.max(0, topic.dislikes - 1);
            newLikes = topic.likes + 1;
            setUserLikes(prev => ({ ...prev, [topicId]: 'like' }));
          } else {
            // Add like
            newLikes = topic.likes + 1;
            setUserLikes(prev => ({ ...prev, [topicId]: 'like' }));
          }

          return { ...topic, likes: newLikes, dislikes: newDislikes };
        }
        return topic;
      }),
    );
  };

  const handleDislike = (topicId: string) => {
    const currentAction = userLikes[topicId];
    setTopics(prevTopics =>
      prevTopics.map(topic => {
        if (topic.id === topicId) {
          let newLikes = topic.likes;
          let newDislikes = topic.dislikes;

          if (currentAction === 'dislike') {
            // Remove dislike
            newDislikes = Math.max(0, topic.dislikes - 1);
            setUserLikes(prev => ({ ...prev, [topicId]: null }));
          } else if (currentAction === 'like') {
            // Switch from like to dislike
            newLikes = Math.max(0, topic.likes - 1);
            newDislikes = topic.dislikes + 1;
            setUserLikes(prev => ({ ...prev, [topicId]: 'dislike' }));
          } else {
            // Add dislike
            newDislikes = topic.dislikes + 1;
            setUserLikes(prev => ({ ...prev, [topicId]: 'dislike' }));
          }

          return { ...topic, likes: newLikes, dislikes: newDislikes };
        }
        return topic;
      }),
    );
  };

  const getTrainingPointColor = (type: string) => {
    switch (type) {
      case 'do':
        return colors.success;
      case 'avoid':
        return colors.danger;
      case 'neutral':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Public Issues':
        return '#E91E63'; // pink
      case 'Social Welfare':
        return '#00897B'; // teal
      case 'Environmental':
        return '#43A047'; // green
      case 'Infrastructure':
        return '#3949AB'; // indigo
      case 'Economy & Jobs':
        return '#FB8C00'; // orange
      default:
        return colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 6,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 18,
      lineHeight: 20,
    },
    searchContainer: {
      marginBottom: 16,
    },
    searchInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    categoryButtonActive: {
      backgroundColor: `${colors.primary}18`,
      borderColor: colors.primary,
    },
    categoryButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    categoryButtonTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    topicCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    topicHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    topicTitleRow: {
      flex: 1,
      marginRight: 8,
    },
    topicTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    topicCategory: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '800',
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    topicDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    engagementRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
      alignItems: 'center',
    },
    engagementButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    engagementButtonActive: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    engagementText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    engagementTextActive: {
      color: colors.primary,
    },
    expandButton: {
      padding: 4,
    },
    expandedContent: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginTop: 12,
      marginBottom: 8,
    },
    whenToUseList: {
      marginBottom: 12,
    },
    whenToUseItem: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 4,
      paddingLeft: 8,
    },
    keyPointsList: {
      marginBottom: 12,
    },
    keyPointItem: {
      fontSize: 13,
      color: colors.textPrimary,
      marginBottom: 6,
      paddingLeft: 8,
      fontWeight: '600',
    },
    trainingPointsList: {
      marginBottom: 12,
    },
    trainingPointCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderLeftWidth: 4,
    },
    trainingPointText: {
      fontSize: 13,
      color: colors.textPrimary,
      lineHeight: 18,
    },
    socialMediaSection: {
      marginBottom: 12,
    },
    emphasizeList: {
      marginBottom: 8,
    },
    emphasizeItem: {
      fontSize: 13,
      color: colors.success,
      marginBottom: 4,
      paddingLeft: 8,
    },
    avoidList: {
      marginBottom: 8,
    },
    avoidItem: {
      fontSize: 13,
      color: colors.danger,
      marginBottom: 4,
      paddingLeft: 8,
    },
    sampleQuestionCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    questionText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    responseText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
      fontStyle: 'italic',
    },
    emptyState: {
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  const renderTopicItem = ({ item }: { item: Topic }) => {
    const isExpanded = expandedTopic === item.id;

    return (
      <View style={styles.topicCard}>
        <TouchableOpacity
          style={styles.topicHeader}
          onPress={() => toggleTopic(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.topicTitleRow}>
            <Text
              style={[
                styles.topicCategory,
                { color: getCategoryColor(item.category) },
              ]}
            >
              {item.category}
            </Text>
            <Text style={styles.topicTitle}>{item.title}</Text>
            <Text style={styles.topicDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.engagementRow}>
              <TouchableOpacity
                style={[
                  styles.engagementButton,
                  userLikes[item.id] === 'like' &&
                    styles.engagementButtonActive,
                ]}
                onPress={() => handleLike(item.id)}
              >
                <MaterialIcons
                  name="thumb-up"
                  size={16}
                  color={
                    userLikes[item.id] === 'like'
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.engagementText,
                    userLikes[item.id] === 'like' &&
                      styles.engagementTextActive,
                  ]}
                >
                  {item.likes}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.engagementButton,
                  userLikes[item.id] === 'dislike' &&
                    styles.engagementButtonActive,
                ]}
                onPress={() => handleDislike(item.id)}
              >
                <MaterialIcons
                  name="thumb-down"
                  size={16}
                  color={
                    userLikes[item.id] === 'dislike'
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.engagementText,
                    userLikes[item.id] === 'dislike' &&
                      styles.engagementTextActive,
                  ]}
                >
                  {item.dislikes}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.expandButton}>
            <MaterialIcons
              name={isExpanded ? 'expand-less' : 'expand-more'}
              size={24}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View>
              <Text style={styles.sectionTitle}>When to Use</Text>
              <View style={styles.whenToUseList}>
                {item.whenToUse.map((use, index) => (
                  <Text key={index} style={styles.whenToUseItem}>
                    • {use}
                  </Text>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Key Points to Emphasize</Text>
              <View style={styles.keyPointsList}>
                {item.keyPoints.map((point, index) => (
                  <Text key={index} style={styles.keyPointItem}>
                    • {point}
                  </Text>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Training Points</Text>
              <View style={styles.trainingPointsList}>
                {item.trainingPoints.map(tp => (
                  <View
                    key={tp.id}
                    style={[
                      styles.trainingPointCard,
                      { borderLeftColor: getTrainingPointColor(tp.type) },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <MaterialIcons
                        name={
                          tp.type === 'do'
                            ? 'check-circle'
                            : tp.type === 'avoid'
                            ? 'cancel'
                            : 'info'
                        }
                        size={16}
                        color={getTrainingPointColor(tp.type)}
                      />
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: getTrainingPointColor(tp.type),
                          marginLeft: 6,
                          textTransform: 'uppercase',
                        }}
                      >
                        {tp.type}
                      </Text>
                    </View>
                    <Text style={styles.trainingPointText}>{tp.point}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.socialMediaSection}>
              <Text style={styles.sectionTitle}>Social Media Tips</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: colors.success,
                  marginBottom: 4,
                }}
              >
                Emphasize:
              </Text>
              <View style={styles.emphasizeList}>
                {item.socialMediaTips.emphasize.map((tip, index) => (
                  <Text key={index} style={styles.emphasizeItem}>
                    ✓ {tip}
                  </Text>
                ))}
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: colors.danger,
                  marginTop: 8,
                  marginBottom: 4,
                }}
              >
                Avoid:
              </Text>
              <View style={styles.avoidList}>
                {item.socialMediaTips.avoid.map((tip, index) => (
                  <Text key={index} style={styles.avoidItem}>
                    ✗ {tip}
                  </Text>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Sample Questions & Responses
              </Text>
              {item.sampleQuestions.map((qa, index) => (
                <View key={index} style={styles.sampleQuestionCard}>
                  <Text style={styles.questionText}>Q: {qa.question}</Text>
                  <Text style={styles.responseText}>A: {qa.response}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Topics to Speak in Public</Text>
        <Text style={styles.subtitle}>
          Smart knowledge hub to help you pick the right talking points for
          public meetings, media interactions, and social media posts.
        </Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category &&
                    styles.categoryButtonTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredTopics.length > 0 ? (
          <FlatList
            data={filteredTopics}
            renderItem={renderTopicItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No topics found matching your search
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
