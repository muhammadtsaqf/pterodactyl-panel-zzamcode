@extends('layouts.admin')

@section('title')
    Store Packages
@endsection

@section('content-header')
    <h1>Store Packages<small>Manage predefined resource packages for the store.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.store') }}">Store</a></li>
        <li class="active">Packages</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Package List</h3>
                <div class="box-tools">
                    <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#newPackageModal">Create New Package</button>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Price / Month</th>
                            <th>Resources</th>
                            <th>Egg / Node</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        @foreach($packages as $package)
                            <tr>
                                <td><code>{{ $package->id }}</code></td>
                                <td><strong>{{ $package->name }}</strong><br><small>{{ $package->description }}</small></td>
                                <td>Rp {{ number_format($package->price, 0, ',', '.') }}</td>
                                <td>
                                    <span class="label label-default">{{ $package->cpu }}% CPU</span>
                                    <span class="label label-default">{{ $package->memory }}MB RAM</span>
                                    <span class="label label-default">{{ $package->disk }}MB Disk</span><br>
                                    <small>{{ $package->databases }} DBs | {{ $package->backups }} Backups | {{ $package->ports }} Ports</small>
                                </td>
                                <td>
                                    <strong>Egg:</strong> {{ $package->egg ? $package->egg->name : 'N/A' }}<br>
                                    <strong>Node:</strong> {{ $package->node ? $package->node->name : 'N/A' }}
                                </td>
                                <td>
                                    @if($package->is_active)
                                        <span class="label label-success">Active</span>
                                    @else
                                        <span class="label label-danger">Inactive</span>
                                    @endif
                                </td>
                                <td>
                                    <button class="btn btn-xs btn-primary" data-toggle="modal" data-target="#editPackageModal{{ $package->id }}"><i class="fa fa-pencil"></i></button>
                                    <form action="{{ route('admin.store.packages.destroy', $package->id) }}" method="POST" style="display:inline;">
                                        {!! csrf_field() !!}
                                        {!! method_field('DELETE') !!}
                                        <button class="btn btn-xs btn-danger" type="submit" onclick="return confirm('Are you sure you want to delete this package?')"><i class="fa fa-trash"></i></button>
                                    </form>
                                </td>
                            </tr>
                            
                            <!-- Edit Modal -->
                            <div class="modal fade" id="editPackageModal{{ $package->id }}" tabindex="-1" role="dialog">
                                <form action="{{ route('admin.store.packages.update', $package->id) }}" method="POST">
                                    {!! csrf_field() !!}
                                    {!! method_field('PATCH') !!}
                                    <div class="modal-dialog modal-lg" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                                <h4 class="modal-title">Edit Package: {{ $package->name }}</h4>
                                            </div>
                                            <div class="modal-body row">
                                                <div class="form-group col-md-6">
                                                    <label>Package Name</label>
                                                    <input type="text" class="form-control" name="name" value="{{ $package->name }}" required>
                                                </div>
                                                <div class="form-group col-md-6">
                                                    <label>Price (per Month)</label>
                                                    <input type="number" class="form-control" name="price" value="{{ $package->price }}" required>
                                                </div>
                                                <div class="form-group col-md-12">
                                                    <label>Description</label>
                                                    <input type="text" class="form-control" name="description" value="{{ $package->description }}">
                                                </div>
                                                <div class="form-group col-md-4">
                                                    <label>CPU Limit (%)</label>
                                                    <input type="number" class="form-control" name="cpu" value="{{ $package->cpu }}" required>
                                                </div>
                                                <div class="form-group col-md-4">
                                                    <label>Memory/RAM Limit (MB)</label>
                                                    <input type="number" class="form-control" name="memory" value="{{ $package->memory }}" required>
                                                </div>
                                                <div class="form-group col-md-4">
                                                    <label>Disk Limit (MB)</label>
                                                    <input type="number" class="form-control" name="disk" value="{{ $package->disk }}" required>
                                                </div>
                                                <div class="form-group col-md-4">
                                                    <label>Databases</label>
                                                    <input type="number" class="form-control" name="databases" value="{{ $package->databases }}" required>
                                                </div>
                                                <div class="form-group col-md-4">
                                                    <label>Backups</label>
                                                    <input type="number" class="form-control" name="backups" value="{{ $package->backups }}" required>
                                                </div>
                                                <div class="form-group col-md-4">
                                                    <label>Ports (Allocations)</label>
                                                    <input type="number" class="form-control" name="ports" value="{{ $package->ports }}" required>
                                                </div>
                                                <div class="form-group col-md-6">
                                                    <label>Node</label>
                                                    <select class="form-control" name="node_id" required>
                                                        @foreach($nodes as $node)
                                                            <option value="{{ $node->id }}" @if($package->node_id == $node->id) selected @endif>{{ $node->name }}</option>
                                                        @endforeach
                                                    </select>
                                                </div>
                                                <div class="form-group col-md-6">
                                                    <label>Egg</label>
                                                    <select class="form-control" name="egg_id" required>
                                                        @foreach($eggs as $egg)
                                                            <option value="{{ $egg->id }}" @if($package->egg_id == $egg->id) selected @endif>{{ $egg->name }}</option>
                                                        @endforeach
                                                    </select>
                                                </div>
                                                <div class="form-group col-md-12">
                                                    <div class="checkbox checkbox-primary no-margin-bottom">
                                                        <input id="isActive{{ $package->id }}" name="is_active" type="checkbox" value="1" @if($package->is_active) checked @endif>
                                                        <label for="isActive{{ $package->id }}" class="strong">Active</label>
                                                    </div>
                                                    <p class="text-muted small">If unchecked, this package will not be shown in the store.</p>
                                                </div>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                                <button type="submit" class="btn btn-primary">Save Changes</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Create Modal -->
<div class="modal fade" id="newPackageModal" tabindex="-1" role="dialog">
    <form action="{{ route('admin.store.packages.store') }}" method="POST">
        {!! csrf_field() !!}
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">Create New Package</h4>
                </div>
                <div class="modal-body row">
                    <div class="form-group col-md-6">
                        <label>Package Name</label>
                        <input type="text" class="form-control" name="name" required placeholder="e.g. Zero Rock">
                    </div>
                    <div class="form-group col-md-6">
                        <label>Price (per Month)</label>
                        <input type="number" class="form-control" name="price" required placeholder="e.g. 15000">
                    </div>
                    <div class="form-group col-md-12">
                        <label>Description</label>
                        <input type="text" class="form-control" name="description" placeholder="e.g. Cocok untuk server pemula">
                    </div>
                    <div class="form-group col-md-4">
                        <label>CPU Limit (%)</label>
                        <input type="number" class="form-control" name="cpu" required placeholder="100">
                    </div>
                    <div class="form-group col-md-4">
                        <label>Memory/RAM Limit (MB)</label>
                        <input type="number" class="form-control" name="memory" required placeholder="4096">
                    </div>
                    <div class="form-group col-md-4">
                        <label>Disk Limit (MB)</label>
                        <input type="number" class="form-control" name="disk" required placeholder="10240">
                    </div>
                    <div class="form-group col-md-4">
                        <label>Databases</label>
                        <input type="number" class="form-control" name="databases" required placeholder="1">
                    </div>
                    <div class="form-group col-md-4">
                        <label>Backups</label>
                        <input type="number" class="form-control" name="backups" required placeholder="1">
                    </div>
                    <div class="form-group col-md-4">
                        <label>Ports (Allocations)</label>
                        <input type="number" class="form-control" name="ports" required placeholder="1" value="1">
                    </div>
                    <div class="form-group col-md-6">
                        <label>Node</label>
                        <select class="form-control" name="node_id" required>
                            <option value="">Select Node</option>
                            @foreach($nodes as $node)
                                <option value="{{ $node->id }}">{{ $node->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="form-group col-md-6">
                        <label>Egg</label>
                        <select class="form-control" name="egg_id" required>
                            <option value="">Select Egg (Game)</option>
                            @foreach($eggs as $egg)
                                <option value="{{ $egg->id }}">{{ $egg->name }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="form-group col-md-12">
                        <div class="checkbox checkbox-primary no-margin-bottom">
                            <input id="isActiveNew" name="is_active" type="checkbox" value="1" checked>
                            <label for="isActiveNew" class="strong">Active</label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-primary">Create Package</button>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection
