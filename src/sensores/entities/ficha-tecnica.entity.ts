import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity(
    {name: "fichas_tecnicas"}
)
export class FichaTecnica {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    marca: string;

    @Column({ type: "varchar", length: 255 })
    modelo: string;

    @Column({ type: "varchar", length: 255, nullable: true, name: "numero_serie" })
    numeroSerie: string | null;

    @Column({ type: "date", nullable: true, name: "fecha_instalacion" })
    fechaInstalacion: string | null;

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
