import { MsgExecuteContractCompat as BaseMsgExecuteContractCompat } from '@injectivelabs/core-proto-ts/injective/wasmx/v1/tx'
import snakecaseKeys from 'snakecase-keys'
import { ExecArgs } from '../exec-args'
import { MsgBase } from '../../MsgBase'
import { GeneralException } from '@injectivelabs/exceptions'

export declare namespace MsgExecuteContractCompat {
  export interface Params {
    /* Keep in mind that funds have to be lexicographically sorted by denom */
    funds?:
      | {
          denom: string
          amount: string
        }
      | {
          denom: string
          amount: string
        }[]
    sender: string
    contractAddress: string
    /* Used to provide type safety for execution messages */
    execArgs?: ExecArgs

    /* Pass any arbitrary message object to execute */
    exec?: {
      msg: object
      action: string
    }
    /**
     * Same as exec but you don't pass
     * the action as a separate property
     * but as a whole object
     */
    msg?: object
  }

  export type Proto = BaseMsgExecuteContractCompat

  export type Object = BaseMsgExecuteContractCompat.AsObject
}

/**
 * @category Messages
 */
export default class MsgExecuteContractCompat extends MsgBase<
  MsgExecuteContractCompat.Params,
  MsgExecuteContractCompat.Proto,
  MsgExecuteContractCompat.Object
> {
  static fromJSON(
    params: MsgExecuteContractCompat.Params,
  ): MsgExecuteContractCompat {
    return new MsgExecuteContractCompat(params)
  }

  public toProto() {
    const { params } = this

    const message = BaseMsgExecuteContractCompat.create()
    const msg = this.getMsgObject()

    message.msg = JSON.stringify(msg)
    message.sender = params.sender
    message.contract = params.contractAddress

    if (params.funds) {
      const fundsToArray = Array.isArray(params.funds)
        ? params.funds
        : [params.funds]

      const funds = fundsToArray.map((coin) => {
        return `${coin.amount}${coin.denom}`
      })

      message.funds = funds.join(',')
    } else {
      message.funds = '0'
    }

    return BaseMsgExecuteContractCompat.fromPartial(message)
  }

  public toData() {
    const proto = this.toProto()

    return {
      '@type': '/injective.wasmx.v1.MsgExecuteContractCompat',
      ...proto,
    }
  }

  public toAmino() {
    const proto = this.toProto()
    const message = {
      ...snakecaseKeys(proto),
      msg: JSON.stringify(this.getMsgObject()),
    }

    // @ts-ignore
    delete message.funds_list

    return {
      type: 'wasmx/MsgExecuteContractCompat',
      value: message,
    }
  }

  public toWeb3() {
    const amino = this.toAmino()
    const { value } = amino

    return {
      '@type': '/injective.wasmx.v1.MsgExecuteContractCompat',
      ...value,
    }
  }

  public toDirectSign() {
    const proto = this.toProto()

    return {
      type: '/injective.wasmx.v1.MsgExecuteContractCompat',
      message: proto,
    }
  }

  public toBinary(): Uint8Array {
    return BaseMsgExecuteContractCompat.encode(this.toProto()).finish()
  }

  private getMsgObject() {
    const { params } = this

    if ((params.exec || params.msg) && params.execArgs) {
      throw new GeneralException(
        new Error('Please provide only one exec|msg argument'),
      )
    }

    if (params.execArgs) {
      return params.execArgs.toExecData()
    }

    if (params.exec) {
      return {
        [params.exec.action]: params.exec.msg,
      }
    }

    if (params.msg) {
      return params.msg
    }

    throw new GeneralException(
      new Error('Please provide at least one exec argument'),
    )
  }
}
