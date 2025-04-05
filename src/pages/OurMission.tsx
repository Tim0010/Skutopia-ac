import { motion } from "framer-motion";
import PublicLayout from "@/components/PublicLayout";
import {
  Eye,
  Wrench,
  Star,
  Globe,
  Zap,
  UsersRound,
  ShieldCheck,
  HeartHandshake,
  CheckCircle,
  PartyPopper,
  Phone,
  MessageSquare // Assuming this is used for WhatsApp
} from "lucide-react";

// Animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay }
  })
};

const valueCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay }
  })
};

export default function OurMission() {
  return (
    <PublicLayout
      title="Our Mission & Vision"
      subtitle="Empowering Zambian students through quality education, mentorship, and opportunity."
    >
      <div className="space-y-16 md:space-y-24">

        {/* Vision Section */}
        <motion.section
          custom={0.1}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="bg-gradient-to-br from-skutopia-50 to-blue-50 dark:from-skutopia-900/30 dark:to-blue-900/10 p-8 rounded-2xl shadow-sm border border-skutopia-100 dark:border-skutopia-800"
        >
          <div className="flex items-center mb-4">
            <Eye className="h-8 w-8 text-skutopia-600 dark:text-skutopia-400 mr-3" />
            <h2 className="text-2xl md:text-3xl font-bold text-skutopia-700 dark:text-skutopia-300">Our Vision</h2>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            To create a Zambia where every student has access to quality education resources,
            personalized mentorship, and opportunities to excel in STEM fields, regardless of
            their background or economic status.
          </p>
        </motion.section>

        {/* What We Do Section */}
        <motion.section
          custom={0.2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="flex items-center mb-4">
            <Wrench className="h-8 w-8 text-skutopia-600 dark:text-skutopia-400 mr-3" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">What We Do</h2>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            At Skutopia Academy, we're dedicated to bridging the educational gap for Zambian students.
            We provide a comprehensive platform that combines cutting-edge technology with personalized
            learning experiences to help students achieve academic excellence and prepare for future careers.
          </p>
        </motion.section>

        {/* Core Values Section */}
        <motion.section
          custom={0.3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="flex items-center mb-6">
            <Star className="h-8 w-8 text-skutopia-600 dark:text-skutopia-400 mr-3" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Star, title: "Excellence", description: "We strive for the highest standards in all our educational resources and mentorship programs.", color: "text-yellow-500", delay: 0 },
              { icon: Globe, title: "Accessibility", description: "We believe quality education should be accessible to all Zambian students.", color: "text-blue-500", delay: 0.1 },
              { icon: Zap, title: "Innovation", description: "We continuously evolve our platform with the latest educational technologies and methods.", color: "text-purple-500", delay: 0.2 },
              { icon: UsersRound, title: "Community", description: "We foster a supportive community of learners, educators, and mentors.", color: "text-green-500", delay: 0.3 },
              { icon: ShieldCheck, title: "Integrity", description: "We operate with honesty, transparency, and ethical standards in all our endeavors.", color: "text-red-500", delay: 0.4 },
            ].map((value) => (
              <motion.div
                key={value.title}
                custom={value.delay}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={valueCardVariants}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
              >
                <value.icon className={`h-10 w-10 mb-4 ${value.color}`} />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Commitment Section */}
        <motion.section
          custom={0.4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="flex items-center mb-6">
            <HeartHandshake className="h-8 w-8 text-skutopia-600 dark:text-skutopia-400 mr-3" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Our Commitment</h2>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            We are committed to supporting Zambian students throughout their educational journey,
            from secondary school to university and beyond. Through our platform, we provide:
          </p>
          <ul className="space-y-3">
            {[
              "Comprehensive study materials aligned with the Zambian curriculum",
              "Practice tests and assessments to measure progress",
              "Personalized learning paths tailored to individual needs",
              "Mentorship from experienced professionals and educators",
              "Information on scholarship opportunities for higher education",
              "Career guidance and professional development resources"
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Join Us Section */}
        <motion.section
          custom={0.5}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center mb-4">
            <PartyPopper className="h-8 w-8 text-skutopia-600 dark:text-skutopia-400 mr-3" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Join Our Journey</h2>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            We invite students, parents, educators, and mentors to join us in our mission to
            transform education in Zambia. Together, we can build a brighter future for the
            next generation of Zambian leaders, innovators, and problem-solvers.
          </p>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="font-semibold text-gray-800 dark:text-white">Find us in person:</strong> Kabanana, off Mai Chola road (Just ask around, everyone knows us!)
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <a href="tel:+260974274991" className="inline-flex items-center text-skutopia-600 dark:text-skutopia-400 hover:text-skutopia-800 dark:hover:text-skutopia-200 transition-colors">
                <Phone className="h-5 w-5 mr-2" />
                +260 974 274 991
              </a>
              <a href="https://wa.me/919253664013" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-skutopia-600 dark:text-skutopia-400 hover:text-skutopia-800 dark:hover:text-skutopia-200 transition-colors">
                <MessageSquare className="h-5 w-5 mr-2" />
                WhatsApp (+91 9253664013)
              </a>
            </div>
          </div>
        </motion.section>

      </div>
    </PublicLayout>
  );
}
