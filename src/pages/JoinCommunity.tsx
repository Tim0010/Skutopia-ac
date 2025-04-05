import { motion } from "framer-motion";
import { ArrowLeft, Users, MessageCircle, BookOpen, Calendar, CheckCircle, Globe, Send, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function JoinCommunity() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    grade: "",
    school: "",
    province: "",
    subjects: [] as string[],
    email: "",
    phone: ""
  });
  
  const [submitted, setSubmitted] = useState(false);
  
  const provinces = [
    "Central", "Copperbelt", "Eastern", "Luapula", 
    "Lusaka", "Muchinga", "Northern", "North-Western", 
    "Southern", "Western"
  ];
  
  const subjectOptions = [
    "Mathematics", "English", "Science", "Physics", "Chemistry", 
    "Biology", "Geography", "History", "Civic Education", 
    "Computer Studies", "Religious Education", "Commerce", 
    "Principles of Accounts", "Business Studies", "Literature"
  ];
  
  const communityBenefits = [
    {
      title: "Peer Support Network",
      description: "Connect with fellow students across Zambia to share knowledge, resources, and encouragement.",
      icon: <Users className="h-6 w-6 text-skutopia-500" />
    },
    {
      title: "Study Groups",
      description: "Join subject-specific study groups to collaborate on challenging topics and prepare for exams together.",
      icon: <BookOpen className="h-6 w-6 text-skutopia-500" />
    },
    {
      title: "Community Events",
      description: "Participate in webinars, workshops, and virtual meetups focused on academic and career development.",
      icon: <Calendar className="h-6 w-6 text-skutopia-500" />
    },
    {
      title: "Discussion Forums",
      description: "Engage in moderated discussions about educational topics, current events, and student life.",
      icon: <MessageCircle className="h-6 w-6 text-skutopia-500" />
    }
  ];

  const testimonials = [
    {
      name: "Chanda Mulenga",
      location: "Lusaka",
      quote: "Joining the Skutopia community changed my academic journey. I found study partners who pushed me to excel, and the support network helped me secure a scholarship to university.",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      name: "David Banda",
      location: "Kitwe",
      quote: "The community events and workshops gave me insights into career paths I never considered before. I've made connections with mentors who are guiding me toward my goals.",
      avatar: "https://randomuser.me/api/portraits/men/54.jpg"
    },
    {
      name: "Natasha Zimba",
      location: "Livingstone",
      quote: "As a student from a rural area, I felt isolated in my academic journey until I joined this community. Now I have friends across Zambia who share my passion for learning.",
      avatar: "https://randomuser.me/api/portraits/women/67.jpg"
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubjectChange = (subject: string) => {
    setFormData(prev => {
      if (prev.subjects.includes(subject)) {
        return {
          ...prev,
          subjects: prev.subjects.filter(s => s !== subject)
        };
      } else {
        return {
          ...prev,
          subjects: [...prev.subjects, subject]
        };
      }
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 text-skutopia-600 hover:text-skutopia-700">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main>
        {/* Hero section */}
        <section className="bg-gradient-to-r from-skutopia-600 to-skutopia-800 text-white py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Join Our WhatsApp Learning Community</h1>
              <p className="text-lg sm:text-xl text-skutopia-100 mb-8">
                Connect with fellow students, share knowledge, and grow together in Zambia's largest educational WhatsApp community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#join-form" className="bg-white text-skutopia-700 hover:bg-skutopia-50 px-6 py-3 rounded-md font-medium shadow-lg">
                  Register Now
                </a>
                <a 
                  href="https://wa.me/260974274991?text=I'm%20interested%20in%20joining%20the%20Skutopia%20Academy%20community" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white border border-green-500 px-6 py-3 rounded-md font-medium"
                >
                  Contact via WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Community stats */}
        <section className="py-12 bg-skutopia-50 dark:bg-skutopia-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <p className="text-4xl font-bold text-skutopia-600 dark:text-skutopia-400 mb-2">5,000+</p>
                <p className="text-gray-600 dark:text-gray-300">Active Members</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <p className="text-4xl font-bold text-skutopia-600 dark:text-skutopia-400 mb-2">200+</p>
                <p className="text-gray-600 dark:text-gray-300">Study Groups</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <p className="text-4xl font-bold text-skutopia-600 dark:text-skutopia-400 mb-2">10</p>
                <p className="text-gray-600 dark:text-gray-300">Provinces Represented</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Community benefits */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Community Benefits</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Discover how joining our community can enhance your educational journey and connect you with like-minded peers.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {communityBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex"
                >
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-skutopia-100 dark:bg-skutopia-900/30 rounded-full flex items-center justify-center">
                      {benefit.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Community Voices</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Hear from students who have found value in our community.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.quote}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How to join */}
        <section className="py-16 sm:py-24" id="join-form">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Join Our WhatsApp Community</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Fill out the form below to join our WhatsApp learning community. Connect with fellow students, share resources, and get support.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              {!submitted ? (
                <motion.form 
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 border border-gray-100 dark:border-gray-700"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="col-span-2 md:col-span-1">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-skutopia-500 focus:border-skutopia-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Your full name"
                      />
                    </div>

                    {/* Age */}
                    <div className="col-span-2 md:col-span-1">
                      <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        required
                        min="10"
                        max="30"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-skutopia-500 focus:border-skutopia-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Your age"
                      />
                    </div>

                    {/* Grade */}
                    <div className="col-span-2 md:col-span-1">
                      <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Grade/Year *
                      </label>
                      <select
                        id="grade"
                        name="grade"
                        required
                        value={formData.grade}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-skutopia-500 focus:border-skutopia-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select your grade</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                        <option value="University Year 1">University Year 1</option>
                        <option value="University Year 2">University Year 2</option>
                        <option value="University Year 3">University Year 3</option>
                        <option value="University Year 4">University Year 4</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* School */}
                    <div className="col-span-2 md:col-span-1">
                      <label htmlFor="school" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        School/Institution *
                      </label>
                      <input
                        type="text"
                        id="school"
                        name="school"
                        required
                        value={formData.school}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-skutopia-500 focus:border-skutopia-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Your school or institution"
                      />
                    </div>

                    {/* Province */}
                    <div className="col-span-2 md:col-span-1">
                      <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Province *
                      </label>
                      <select
                        id="province"
                        name="province"
                        required
                        value={formData.province}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-skutopia-500 focus:border-skutopia-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select your province</option>
                        {provinces.map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Phone Number */}
                    <div className="col-span-2 md:col-span-1">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-skutopia-500 focus:border-skutopia-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="+260 97 1234567"
                      />
                    </div>

                    {/* Email */}
                    <div className="col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-skutopia-500 focus:border-skutopia-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="your.email@example.com"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional, but recommended for additional resources</p>
                    </div>

                    {/* Subjects */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subjects of Interest *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {subjectOptions.map((subject) => (
                          <div key={subject} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`subject-${subject}`}
                              checked={formData.subjects.includes(subject)}
                              onChange={() => handleSubjectChange(subject)}
                              className="h-4 w-4 text-skutopia-600 focus:ring-skutopia-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`subject-${subject}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              {subject}
                            </label>
                          </div>
                        ))}
                      </div>
                      {formData.subjects.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">Please select at least one subject</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={formData.subjects.length === 0}
                      className={`w-full bg-skutopia-600 hover:bg-skutopia-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center ${
                        formData.subjects.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Join WhatsApp Community
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      By submitting this form, you'll be added to our WhatsApp community group
                    </p>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 border border-gray-100 dark:border-gray-700 text-center"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Thank You for Joining!</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    You're almost there! Click the button below to join our WhatsApp community.
                  </p>
                  <a
                    href="https://chat.whatsapp.com/JHITgdwmydo0TLzZUG1Kkl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-2" />
                      <span>Join WhatsApp Group</span>
                    </div>
                  </a>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                    If you have any issues joining the group, please contact us at <a href="mailto:skutopia.zm@gmail.com" className="text-skutopia-600 dark:text-skutopia-400 hover:underline">skutopia.zm@gmail.com</a>
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 sm:py-24 bg-skutopia-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Ready to Join Our WhatsApp Community?</h2>
              <p className="text-xl text-skutopia-100 mb-8 max-w-2xl mx-auto">
                Connect with students across Zambia, access exclusive resources, and accelerate your educational journey through our WhatsApp group.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="#join-form" 
                  className="bg-white text-skutopia-700 hover:bg-skutopia-50 px-8 py-4 rounded-md font-medium text-lg shadow-lg inline-flex items-center justify-center"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Fill Out the Form
                </a>
                <a
                  href="https://wa.me/260974274991?text=I'm%20interested%20in%20joining%20the%20Skutopia%20Academy%20community"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white border border-green-500 px-8 py-4 rounded-md font-medium text-lg inline-flex items-center justify-center"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Us Directly
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
