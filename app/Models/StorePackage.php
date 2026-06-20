<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StorePackage extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'store_packages';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'price',
        'cpu',
        'memory',
        'disk',
        'databases',
        'backups',
        'ports',
        'egg_id',
        'node_id',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'price' => 'integer',
        'cpu' => 'integer',
        'memory' => 'integer',
        'disk' => 'integer',
        'databases' => 'integer',
        'backups' => 'integer',
        'ports' => 'integer',
        'egg_id' => 'integer',
        'node_id' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Gets the egg associated with this package.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function egg(): BelongsTo
    {
        return $this->belongsTo(Egg::class, 'egg_id');
    }

    /**
     * Gets the node associated with this package.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function node(): BelongsTo
    {
        return $this->belongsTo(Node::class, 'node_id');
    }
}
