import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Appointment } from 'src/appointments/appointments.model';
import { Doctor, DoctorDocument } from './doctors.model';
import { CreateDoctorDto } from './dto/doctorsCreate.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
  ) {}

  async createDoctor(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const createdDoctor = new this.doctorModel(createDoctorDto);
    return createdDoctor.save();
  }
  async findAllDoctor(): Promise<Doctor[]> {
    return this.doctorModel.find().exec();
  }
  async findOneDoctor(doctorID: Doctor): Promise<Doctor> {
    return this.doctorModel.findById(doctorID).exec();
  }
  async addNewAppointment(
    appointmentID: ObjectId,
    doctorID: Doctor,
  ): Promise<Doctor> {
    const findedDoctor = await this.doctorModel.findById(doctorID).exec();
    const appointmentArray: ObjectId[] = findedDoctor.appointments_accepted;
    if (appointmentArray) {
      if (appointmentArray.length >= 3) {
        throw new HttpException(
          'BadRequest. Doctor already has 3 appointmetns!',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (appointmentArray.indexOf(appointmentID) !== -1) {
        throw new HttpException(
          'BadRequest. Doctor already has this appointmetn!',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (appointmentArray.length === 2) {
      await findedDoctor.$set('free', false).save();
    }
    return findedDoctor
      .$set('appointments_accepted', [...appointmentArray, appointmentID])
      .save();
  }

  async removeAppointment(
    appointmentID: ObjectId,
    doctorID: Doctor,
  ): Promise<Doctor> {
    const findedDoctor = await this.doctorModel.findById(doctorID).exec();
    let appointmentArray: ObjectId[] = findedDoctor.appointments_accepted;
    if (appointmentArray.indexOf(appointmentID) === -1) {
      throw new HttpException(
        "BadRequest. Doctor doesn't accept this appointment",
        HttpStatus.BAD_REQUEST,
      );
    }
    appointmentArray.splice(appointmentArray.indexOf(appointmentID), 1);
    if (findedDoctor.free === false) {
      await findedDoctor.$set('free', true).save();
    }
    return await findedDoctor
      .$set('appointments_accepted', [...appointmentArray])
      .save();
  }
}
