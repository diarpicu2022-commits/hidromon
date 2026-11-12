import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity(
    {name: "ubicaciones"}
)
export class Ubicacion {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    municipio: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    vereda: string | null;

    @Column({ type: "float" })
    latitud: number;

    @Column({ type: "float" })
    longitud: number;

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
