package com.enonic.app.fotoware;

import java.util.Set;

import com.enonic.xp.attachment.Attachments;
import com.enonic.xp.content.Content;
import com.enonic.xp.content.ContentInheritType;
import com.enonic.xp.content.ContentPublishInfo;
import com.enonic.xp.content.WorkflowInfo;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.page.Page;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import com.enonic.xp.sortvalues.SortValuesProperty;

class ContentMapper
	implements MapSerializable
{
	private final Content value;

	private final SortValuesProperty sort;

	private final Float score;

	public ContentMapper( final Content value )
	{
		this( value, null, null );
	}

	public ContentMapper( final Content value, final SortValuesProperty sort, final Float score )
	{
		this.value = value;
		this.sort = sort;
		this.score = score;
	}

	private void serialize( final MapGenerator gen, final Content value )
	{
		gen.value( "_id", value.getId() );
		gen.value( "_name", value.getName() );
		gen.value( "_path", value.getPath() );
		gen.value( "_score", this.score );
		gen.value( "creator", value.getCreator() );
		gen.value( "modifier", value.getModifier() );
		gen.value( "createdTime", value.getCreatedTime() );
		gen.value( "modifiedTime", value.getModifiedTime() );
		gen.value( "owner", value.getOwner() );
		gen.value( "type", value.getType() );
		gen.value( "displayName", value.getDisplayName() );
		gen.value( "language", value.getLanguage() );
		gen.value( "valid", value.isValid() );
		gen.value( "originProject", value.getOriginProject() );
		if ( value.getChildOrder() != null )
		{
			gen.value( "childOrder", value.getChildOrder().toString() );
		}
		if ( sort != null && sort.getValues() != null )
		{
			gen.array( "_sort" );
			for ( final Object sortValue : sort.getValues() )
			{
				gen.value( sortValue );
			}
			gen.end();
		}

		serializeData( gen, value.getData() );
		serializePage( gen, value.getPage() );
		serializeAttachments( gen, value.getAttachments() );
		serializePublishInfo( gen, value.getPublishInfo() );
		serializeWorkflowInfo( gen, value.getWorkflowInfo() );
		serializeInherit( gen, value.getInherit() );
	}

	private void serializeData( final MapGenerator gen, final PropertyTree value )
	{
		gen.map( "data" );
		new PropertyTreeMapper( value ).serialize( gen );
		gen.end();
	}

	private void serializePublishInfo( final MapGenerator gen, final ContentPublishInfo info )
	{
		gen.map( "publish" );
		if ( info != null )
		{
			gen.value( "from", info.from() );
			gen.value( "to", info.to() );
			gen.value( "first", info.first() );
		}
		gen.end();
	}

	private void serializeWorkflowInfo( final MapGenerator gen, final WorkflowInfo info )
	{
		gen.map( "workflow" );
		if ( info != null )
		{
			gen.value( "state", info.getState().toString() );
		}
		gen.end();
	}

	private void serializePage( final MapGenerator gen, final Page value )
	{
		if ( value != null )
		{
			new PageMapper( value ).serialize( gen );
		}
		else
		{
			gen.map( "page" );
			gen.end();
		}
	}

	private void serializeAttachments( final MapGenerator gen, final Attachments value )
	{
		gen.map( "attachments" );
		if ( value != null )
		{
			new AttachmentsMapper( value ).serialize( gen );
		}
		gen.end();
	}

	private void serializeInherit( final MapGenerator gen, final Set<ContentInheritType> value )
	{
		if ( !value.isEmpty() )
		{
			gen.array( "inherit" );
			value.forEach( gen::value );
			gen.end();
		}
	}

	@Override
	public void serialize( final MapGenerator gen )
	{
		serialize( gen, this.value );
	}
}
