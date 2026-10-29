import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity(
    {name: "perfiles"}
)
export class Perfil {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    municipio: string;

    @Column({ type: "varchar", length: 255 })
    finca: string;

    @Column({ type: "varchar", length: 255, nullable: true})
    nickname: string;

    @Column({ type: "varchar", length: 255, nullable: true})
    avatar: string;

    @CreateDateColumn(
        {
            type: "timestamptz",
            default: () => "CURRENT_TIMESTAMP",
            name: "created_at"
        })
    createdAt: Date;

    @UpdateDateColumn(
        {
            type: "timestamptz",
            default: () => "CURRENT_TIMESTAMP",
            name: "updated_at"
        })
    updatedAt: Date;
}
