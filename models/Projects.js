import mongoose from 'mongoose';
import schema from '../database/schemas/ProjectsSchema.js';

const Projects = mongoose.model('Projects',schema);

export default Projects;


