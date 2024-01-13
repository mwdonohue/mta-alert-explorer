import { ObjectId } from 'mongodb'
import BaseAlert from '../../../common/dist/types/alert'

export interface Alert extends BaseAlert {
  _id: ObjectId
}
