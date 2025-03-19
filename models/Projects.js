import mongoose from 'mongoose';
import schema from './schemas/ProjectsSchema.js';

const Projects = mongoose.model('Projects',schema);

export default Projects;


