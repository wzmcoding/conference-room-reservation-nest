/* eslint-disable prettier/prettier */
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permission.entity";

@Entity({
    name: 'roles'
})
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 20,
        comment: '角色名'
    })
    name: string;

    /* 表示与 Permission 实体建立多对多关系 */
    @ManyToMany(() => Permission)
    /* 创建一个中间表来存储关系 */
    @JoinTable({
        name: 'role_permissions'
    })
    /* 定义一个存储权限的数组属性 */
    permissions: Permission[] 
}
